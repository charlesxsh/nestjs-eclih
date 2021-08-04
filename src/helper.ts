import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory } from '@nestjs/core';
import { CommanderService } from './commander.service';

/**
 * Helper function for entrypoint of CLI.
 * @param appModule Nestjs Module class
 */
async function bootstrapCommanderSvc(
  appModule: any,
  options?: NestApplicationContextOptions,
): Promise<CommanderService> {
    const finalOptions = {
      abortOnError: true,
      ...options
    } as NestApplicationContextOptions;
  
  const app = await NestFactory.createApplicationContext(appModule, finalOptions);
  const svc = app.get(CommanderService);
  if (!svc) {
    throw new Error('Failed to bootstrap CommanderService');
  }
  return svc;
}

export async function bootstrapCli(
  appModule: any,
  options?: NestApplicationContextOptions,
) {
  let svc: CommanderService = null;
  try {
    svc = await bootstrapCommanderSvc(appModule, options);
    svc.start();
  } catch (err) {
    console.error(err);
  }
}

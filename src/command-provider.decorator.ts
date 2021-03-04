import 'reflect-metadata';
import { CommanderService } from './commander.service';
import { NC_CPROVIDERS, NC_CPROVIDER_CMD } from './metadatas';

export function CommandProvider(command?: string): ClassDecorator {
  return function (target) {
    const targets = Reflect.getMetadata(NC_CPROVIDERS, CommanderService) || [];
    targets.push({
      target,
      command,
    });
    Reflect.defineMetadata(NC_CPROVIDERS, targets, CommanderService);
    Reflect.defineMetadata(NC_CPROVIDER_CMD, command, target);
  };
}

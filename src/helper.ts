import { NestApplicationContextOptions } from "@nestjs/common/interfaces/nest-application-context-options.interface";
import { NestFactory } from "@nestjs/core";
import { CommanderService } from "./commander.service";

/**
 * Helper function for entrypoint of CLI.
 * @param appModule Nestjs Module class
 */
export async function bootstrapCli(appModule: object, options?:NestApplicationContextOptions) {
    if(!options){
        options = {
            logger: false
        }
    }
    const app = await NestFactory.createApplicationContext(appModule, options);
    const cmdSvc = app.get(CommanderService);
    return cmdSvc.startAsync();
}
import { NestFactory } from "@nestjs/core";
import { CommanderService } from "./commander.service";

/**
 * Helper function for entrypoint of CLI.
 * @param appModule Nestjs Module class
 */
export async function bootstrapCli(appModule: object) {
    const app = await NestFactory.createApplicationContext(appModule);
    const cmdSvc = app.get(CommanderService);
    return cmdSvc.startAsync();
}
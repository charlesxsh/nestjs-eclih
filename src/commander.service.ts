import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Command, ParseOptions } from "commander";
import { NC_CPROVIDERS, NC_CPROVIDER_CHILD_CMDS, NC_CPROVIDER_CMD } from "./metadatas";
import { COMMANDER_ROOT_CMD } from "./tokens";


export interface CommandProviderTargetMetadata {
    target: any;
    command?: string;
}

export interface CommandMetadata {

    // Command Provider Target
    cpTarget: any,

    cpPropertyKey: any,

    command: {
        def
    }
}

@Injectable()
export class CommanderService implements OnModuleInit {

    private readonly logger = new Logger(CommanderService.name);
    
    constructor(
        @Inject(COMMANDER_ROOT_CMD) private readonly command:Command,
        private moduleRef: ModuleRef){
            
    }

    /**
     * Since CommanderService are going to retrive instance from module for command's action,
     * instance and instance's dependencies are only available until onModuleInit.
     */
    onModuleInit() {
        this.init();
    }

    private init(): void {
        const targetMetas: CommandProviderTargetMetadata[] = Reflect.getMetadata(NC_CPROVIDERS, CommanderService);
        if(!targetMetas){
            return;
        }
        for(const targetMeta of targetMetas){
            const cpTargetInstance = this.moduleRef.get(targetMeta.target, { strict: false });
            if(!cpTargetInstance){
                throw new Error(`Cannot find instance of ${targetMeta.target.name}, please make sure it is available in module provider array or marked as @Injectable()`)
            }
            
            // Prepare parent command for all child commands defined inside of command provider class
            let parentCmd:Command = null;
            if(targetMeta.command){
                parentCmd = new Command(targetMeta.command) as Command;
                this.command.addCommand(parentCmd);
                this.logger.log(`Added new command '${targetMeta.command}'`);
            } else {
                parentCmd = this.command;
            }

            const childCmdMetas:CommandMetadata[] = Reflect.getMetadata(NC_CPROVIDER_CHILD_CMDS, targetMeta.target);
            if(!childCmdMetas){
                continue;
            }
            for(const childCmdMeta of childCmdMetas){
                const childCmd = new Command(childCmdMeta.command.def);
                console.log(cpTargetInstance);
                const childCmdAction = cpTargetInstance[childCmdMeta.cpPropertyKey].bind(cpTargetInstance)
                childCmd.action(childCmdAction);
                parentCmd.addCommand(childCmd);
                this.logger.log(`Added new child command '${childCmdMeta.command.def}'`);
            }

        }
    }

    startAsync(argv?: string[], options?:ParseOptions): Promise<Command>{
        return this.command.parseAsync(argv, options)
    }

    start(argv?: string[], options?:ParseOptions): Command {
        return this.command.parse(argv, options);
    }
}
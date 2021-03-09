import { ModuleRef } from '@nestjs/core';
import { Command, Option, ParseOptions } from 'commander';
import { CommandConfig } from './command.decorator';
import { COMMANDER_ROOT_CMD } from './tokens';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NC_CPROVIDERS, NC_CPROVIDER_CHILD_CMDS } from './metadatas';

export interface CommandProviderTargetMetadata {
  target: any;
  command?: string;
}

export interface CommandMetadata {
  // Command Provider Target (class)
  cpTarget: any;

  // Command Provider's key (function will be used as command's action)
  cpPropertyKey: any;

  // Command's configuration
  cmdCfg: CommandConfig;
}

@Injectable()
export class CommanderService implements OnModuleInit {
  private readonly logger = new Logger(CommanderService.name);

  constructor(
    @Inject(COMMANDER_ROOT_CMD) private readonly command: Command,
    private moduleRef: ModuleRef,
  ) {}

  /**
   * Since CommanderService are going to retrive instance from module for command's action,
   * instance and instance's dependencies are only available until onModuleInit.
   */
  onModuleInit() {
    this.init();
  }

  /**
   * Retrievd instance(marked with @CommandProvider) from Nestjs's module and
   * initialize corresponding commands and options.
   */
  private init(): void {
    // Find all classes marked with @CommandProvider
    const targetMetas: CommandProviderTargetMetadata[] = Reflect.getMetadata(
      NC_CPROVIDERS,
      CommanderService,
    );

    if (!targetMetas) {
      return;
    }

    for (const targetMeta of targetMetas) {
      const cpTargetInstance = this.moduleRef.get(targetMeta.target, {
        strict: false,
      });
      if (!cpTargetInstance) {
        throw new Error(
          `Cannot find instance of ${targetMeta.target.name}, please make sure it is available in module provider array or marked as @Injectable()`,
        );
      }

      this.logger.log(
        `Found command provider ${cpTargetInstance.constructor.name}`,
      );

      // Prepare parent command for all child commands defined inside of command provider class
      let parentCmd: Command = null;
      if (targetMeta.command) {
        parentCmd = new Command(targetMeta.command) as Command;
        this.command.addCommand(parentCmd);
        this.logger.log(`Added new command '${targetMeta.command}'`);
      } else {
        parentCmd = this.command;
      }

      // Find all command's metadata in the class marked with @CommandProvider
      const childCmdMetas: CommandMetadata[] = Reflect.getMetadata(
        NC_CPROVIDER_CHILD_CMDS,
        targetMeta.target,
      );
      if (!childCmdMetas) {
        continue;
      }
      for (const childCmdMeta of childCmdMetas) {
        // Initialize command object from metadata
        const childCmd = parentCmd.command(childCmdMeta.cmdCfg.name);
        if (childCmdMeta.cmdCfg.description) {
          childCmd.description(childCmdMeta.cmdCfg.description);
        }

        // Initialize the options for the command
        if (childCmdMeta.cmdCfg.options) {
          for (const optCfg of childCmdMeta.cmdCfg.options) {
            const opt = new Option(optCfg.flags, optCfg.description);
            opt.mandatory = !!optCfg.mandatory;
            childCmd.addOption(opt);
          }
        }

        // Initialized the command's action
        const childCmdAction = cpTargetInstance[
          childCmdMeta.cpPropertyKey
        ].bind(cpTargetInstance);
        childCmd.action(childCmdAction);

        // Add initialized command to the parent
        parentCmd.addCommand(childCmd);

        this.logger.log(
          `Added new child command '${childCmdMeta.cmdCfg.name}'`,
        );
      }
    }
  }

  startAsync(argv?: string[], options?: ParseOptions): Promise<Command> {
    return this.command.parseAsync(argv, options);
  }

  start(argv?: string[], options?: ParseOptions): Command {
    return this.command.parse(argv, options);
  }
}

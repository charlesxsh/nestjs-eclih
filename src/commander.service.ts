import { ModuleRef } from '@nestjs/core';
import { alias, aliases, Command, Option, ParseOptions } from 'commander';
import { COMMANDER_ROOT_CMD } from './tokens';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NC_CPROVIDERS, NC_CPROVIDER_CHILD_CMDS } from './metadatas';
import {
  CommandConfig,
  CommandMetadata,
  CommandProviderTargetMetadata,
} from './types';

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
   * Add a new subcommand to parent command by given CommandConfig
   * @param parent Command going to be append
   * @param cfg Subcommand's configuration
   * @returns New created subcommand
   */
  private addSubCommandByCfg(parent: Command, cfg: CommandConfig): Command {
    const newCmd = parent.command(cfg.nameAndArgs);

    // Initialize the command's properties
    if (cfg.description) {
      newCmd.description(cfg.description);
    }
    if (cfg.alias) {
      newCmd.alias(cfg.alias);
    }

    if (cfg.aliases) {
      newCmd.aliases(cfg.aliases);
    }

    // Initialize the options for the command
    if (cfg.options) {
      for (const optCfg of cfg.options) {
        const opt = new Option(optCfg.nameAndArgs, optCfg.description);
        opt.mandatory = !!optCfg.mandatory;
        if (optCfg.default) {
          opt.default(optCfg.default);
        }
        if (optCfg.choices) {
          opt.choices(optCfg.choices);
        }
        newCmd.addOption(opt);
      }
    }

    return newCmd as Command;
  }

  /**
   * Retrievd instance(marked with @CommandProvider) from Nestjs's module and
   * initialize corresponding commands and options.
   */
  private init(): void {
    // Find all classes marked with @CommandProvider
    const cpTargetMetas: CommandProviderTargetMetadata[] = Reflect.getMetadata(
      NC_CPROVIDERS,
      CommanderService,
    );

    if (!cpTargetMetas) {
      return;
    }

    for (const cpTargetMeta of cpTargetMetas) {
      const cpTargetInstance = this.moduleRef.get(cpTargetMeta.target, {
        strict: false,
      });
      if (!cpTargetInstance) {
        throw new Error(
          `Cannot find instance of ${cpTargetMeta.target.name}, please make sure it is available in module provider array or marked as @Injectable()`,
        );
      }

      this.logger.debug(
        `Found command provider ${cpTargetInstance.constructor.name}`,
      );

      // Prepare parent command for all child commands defined inside of command provider class
      let parentCmd: Command = null;
      if (cpTargetMeta.cmdCfg) {
        parentCmd = this.addSubCommandByCfg(this.command, cpTargetMeta.cmdCfg);
        this.logger.debug(
          `Added new command '${cpTargetMeta.cmdCfg.nameAndArgs}'`,
        );
      } else {
        parentCmd = this.command;
      }

      // Find all command's metadata in the class marked with @CommandProvider
      const childCmdMetas: CommandMetadata[] = Reflect.getMetadata(
        NC_CPROVIDER_CHILD_CMDS,
        cpTargetMeta.target,
      );
      if (!childCmdMetas) {
        continue;
      }
      for (const childCmdMeta of childCmdMetas) {
        // Initialize command object from metadata
        const childCmd = this.addSubCommandByCfg(
          parentCmd,
          childCmdMeta.cmdCfg,
        );
        // Initialized the command's action
        const childCmdAction = cpTargetInstance[
          childCmdMeta.cpPropertyKey
        ].bind(cpTargetInstance);

        // Set action to command
        childCmd.action(childCmdAction);

        this.logger.debug(
          `Added new child command '${childCmdMeta.cmdCfg.nameAndArgs}'`,
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

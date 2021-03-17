import { ModuleRef } from '@nestjs/core';
import { Command, Option, ParseOptions } from 'commander';
import { COMMANDER_ROOT_CMD } from './tokens';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NC_CPROVIDERS, NC_CPROVIDER_CHILD_CMDS } from './metadatas';
import {
  CommandConfig,
  CommandMetadata,
  CommandProviderTargetMetadata,
  Constructor,
} from './types';

@Injectable()
export class CommanderService implements OnModuleInit {
  private readonly logger = new Logger(CommanderService.name);

  // To support defining command from multiple place
  private nameToCmd: Map<string, Command>;

  private cmdProviderToCmd: Map<Constructor, Command>;

  // Will be initialized at init();
  private cpTargetMetas: CommandProviderTargetMetadata[];

  // To detect if there any cyclic dependency
  private initiailizingMetas: Set<CommandProviderTargetMetadata>;

  constructor(
    @Inject(COMMANDER_ROOT_CMD) private readonly command: Command,
    private moduleRef: ModuleRef,
  ) {
    this.nameToCmd = new Map();
    this.cmdProviderToCmd = new Map();
    this.initiailizingMetas = new Set();
  }

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
    let subCmd: Command = null;
    if (this.nameToCmd.has(cfg.nameAndArgs)) {
      subCmd = this.nameToCmd.get(cfg.nameAndArgs);
    } else {
      subCmd = parent.command(cfg.nameAndArgs) as Command;
      this.nameToCmd.set(cfg.nameAndArgs, subCmd);
    }

    // Initialize the command's properties
    if (cfg.description) {
      subCmd.description(cfg.description);
    }
    if (cfg.alias) {
      subCmd.alias(cfg.alias);
    }

    if (cfg.aliases) {
      subCmd.aliases(cfg.aliases);
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
        subCmd.addOption(opt);
      }
    }

    return subCmd;
  }

  /**
   * Retrievd instance(marked with @CommandProvider) from Nestjs's module and
   * initialize corresponding commands and options.
   */
  private init(): void {
    // Find all classes marked with @CommandProvider
    this.cpTargetMetas = Reflect.getMetadata(NC_CPROVIDERS, CommanderService);

    if (!this.cpTargetMetas) {
      return;
    }

    this.cpTargetMetas.forEach(this.initCmdFromCpTargetMetadata.bind(this));
  }

  private getCpTargetMetadata(target: any): CommandProviderTargetMetadata {
    return this.cpTargetMetas.find((meta) => meta.target == target);
  }

  initCmdFromCpTargetMetadata(
    cpTargetMeta: CommandProviderTargetMetadata,
  ): Command {
    if (this.initiailizingMetas.has(cpTargetMeta)) {
      throw new Error(`Found cyclic dependency at ${cpTargetMeta.target.name}`);
    }
    this.initiailizingMetas.add(cpTargetMeta);
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
      // If given provider has been initialized
      if (cpTargetMeta.cmdCfg.provider) {
        let targetParentCmd: Command;
        if (this.cmdProviderToCmd.has(cpTargetMeta.cmdCfg.provider)) {
          targetParentCmd = this.cmdProviderToCmd.get(
            cpTargetMeta.cmdCfg.provider,
          );
        } else {
          // If given provider has not been initialized
          targetParentCmd = this.initCmdFromCpTargetMetadata(
            this.getCpTargetMetadata(cpTargetMeta.cmdCfg.provider),
          );
        }

        parentCmd = this.addSubCommandByCfg(
          targetParentCmd,
          cpTargetMeta.cmdCfg,
        );
      } else {
        parentCmd = this.addSubCommandByCfg(this.command, cpTargetMeta.cmdCfg);

        this.logger.debug(
          `Added new command '${cpTargetMeta.cmdCfg.nameAndArgs}'`,
        );
      }
      if (!this.cmdProviderToCmd.has(cpTargetMeta.target)) {
        this.cmdProviderToCmd.set(cpTargetMeta.target, parentCmd);
      }
    } else {
      parentCmd = this.command;
    }

    // Find all command's metadata in the class marked with @CommandProvider
    const childCmdMetas: CommandMetadata[] = Reflect.getMetadata(
      NC_CPROVIDER_CHILD_CMDS,
      cpTargetMeta.target,
    );
    if (!childCmdMetas) {
      return parentCmd;
    }
    for (const childCmdMeta of childCmdMetas) {
      // Initialize command object from metadata
      const childCmd = this.addSubCommandByCfg(
        // Intend to omit childCmdMeta.cmdCfg's provider here
        // We want to force user to implement given sub command into corresponding provider
        parentCmd,
        childCmdMeta.cmdCfg,
      );
      // Initialized the command's action
      const childCmdAction = cpTargetInstance[childCmdMeta.cpPropertyKey].bind(
        cpTargetInstance,
      );

      // Set action to command
      childCmd.action(childCmdAction);

      this.logger.debug(
        `Added new child command '${childCmdMeta.cmdCfg.nameAndArgs}'`,
      );
    }

    this.initiailizingMetas.delete(cpTargetMeta);
    return parentCmd;
  }

  startAsync(argv?: string[], options?: ParseOptions): Promise<Command> {
    return this.command.parseAsync(argv, options);
  }

  start(argv?: string[], options?: ParseOptions): Command {
    return this.command.parse(argv, options);
  }
}

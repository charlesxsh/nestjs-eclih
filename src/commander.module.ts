import { DynamicModule, Module } from '@nestjs/common';
import { Command, program } from 'commander';
import { CommanderService } from './commander.service';
import { COMMANDER_ROOT_CMD } from './tokens';


@Module({
  providers: [
    {
      provide: COMMANDER_ROOT_CMD,
      useValue: program
    },
    CommanderService
  ]
})
export class CommanderModule {
  static withRootCommand(rootCmd: Command): DynamicModule {
    return {
      module: CommanderModule,
      providers: [
        {
          provide: COMMANDER_ROOT_CMD,
          useValue: rootCmd
        },
        CommanderService
      ]
    }
  }
}

import { Logger, Module } from '@nestjs/common';
import { CommandProvider } from '../src/command-provider.decorator';
import { Command } from '../src/command.decorator';
import { CommanderModule } from '../src/commander.module';
import { bootstrapCli } from '../src/helper';

@CommandProvider()
class HelloProvider {
  @Command()
  hello() {
    console.log('hello');
  }
}

@Module({
  imports: [CommanderModule],
  providers: [HelloProvider],
})
export class AppModule {}

bootstrapCli(AppModule);

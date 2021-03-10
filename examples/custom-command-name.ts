import { Module } from '@nestjs/common';
import { CommandProvider } from '../src/command-provider.decorator';
import { Command } from '../src/command.decorator';
import { CommanderModule } from '../src/commander.module';
import { bootstrapCli } from '../src/helper';

@CommandProvider()
class HelloProvider {
  @Command({ nameAndArgs: 'hellohey' })
  hello() {
    console.log('hello world');
  }

  @Command('anotherHello')
  anotherHello() {
    console.log('hello world');
  }
}

@Module({
  imports: [CommanderModule],
  providers: [HelloProvider],
})
export class AppModule {}

bootstrapCli(AppModule);

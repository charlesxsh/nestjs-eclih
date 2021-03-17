import { Module } from '@nestjs/common';
import { CommandProvider } from '../src/command-provider.decorator';
import { Command } from '../src/command.decorator';
import { CommanderModule } from '../src/commander.module';
import { bootstrapCli } from '../src/helper';

@CommandProvider('abc')
class HelloProvider {
  @Command({
    nameAndArgs: 'hello <name>',
    options: [
      {
        nameAndArgs: '-a, --another <abc>',
        mandatory: true,
      },
    ],
  })
  hello(name, options) {
    console.log('hello world', name, options);
  }
}

@CommandProvider({
  provider: HelloProvider,
  nameAndArgs: 'subhello',
})
class SubHelloProvider {
  @Command({
    nameAndArgs: 'hello1 <name>',
    options: [
      {
        nameAndArgs: '-a, --another <abc>',
        mandatory: true,
      },
    ],
  })
  hello(name, options) {
    console.log('hello world', name, options);
  }
}

@Module({
  imports: [CommanderModule],
  providers: [HelloProvider, SubHelloProvider],
})
export class AppModule {}

bootstrapCli(AppModule, {
  logger: ['debug'],
  abortOnError: true,
});

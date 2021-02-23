- [Nestjs Elegant Command Line Interface Hammer](#nestjs-elegant-command-line-interface-hammer)
  - [Example](#example)

# Nestjs Elegant Command Line Interface Hammer
[![NPM Version](https://img.shields.io/npm/v/nestjs-eclih.svg?style=flat)]()
[![NPM License](https://img.shields.io/npm/l/all-contributors.svg?style=flat)](https://github.com/charlesxsh/nestjs-eclih/blob/master/LICENSE)


nestjs-eclih aims to provide the tools to build powerful CLI with simple decorators.
Nestjs provides the powerful dependency injection system. Commander provides the flexible and concrete CLI tools. nestjs-commander combines their advantanges together!

## Example

Create a typescript file hello.ts with following:
```ts
import { Module } from "@nestjs/common";
import { CommandProvider, Command, CommanderModule, bootstrapCli } from "nestjs-eclih";

@CommandProvider()
class HelloProvider {

    @Command()
    hello(){
        console.log("hello");
    }
}

@Module({
    imports: [
        CommanderModule
    ],
    providers:[
        HelloProvider
    ]
})
export class AppModule {}


bootstrapCli(AppModule);
```

Now your first CLI is ready!

```bash
$ ts-node hello.ts --help
Usage: hello [options] [command]

Options:
  -h, --help      display help for command

Commands:
  hello
  help [command]  display help for command

$ ts-node hello.ts hello
hello
```

See more examples in [examples](./examples)
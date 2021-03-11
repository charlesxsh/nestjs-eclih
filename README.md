- [Nestjs Elegant Command Line Interface Hammer](#nestjs-elegant-command-line-interface-hammer)
  - [Commander.js](#commanderjs)
  - [Example](#example)
  - [Tutorial](#tutorial)
    - [@CommandProvider](#commandprovider)
      - [Examples](#examples)
    - [@Command](#command)
      - [Examples](#examples-1)
    - [CommandConfig](#commandconfig)
    - [OptionConfig](#optionconfig)

# Nestjs Elegant Command Line Interface Hammer
[![NPM Version](http://img.shields.io/npm/v/nestjs-eclih.svg?style=flat)](https://www.npmjs.org/package/nestjs-eclih)
[![NPM Downloads](https://img.shields.io/npm/dm/nestjs-eclih.svg?style=flat)](https://npmcharts.com/compare/nestjs-eclih?minimal=true)
[![NPM License](https://img.shields.io/npm/l/all-contributors.svg?style=flat)](https://github.com/charlesxsh/nestjs-eclih/blob/master/LICENSE)


nestjs-eclih aims to provide the tools to build powerful CLI with simple(only two) decorators.
Nestjs provides the powerful dependency injection system. Commander provides the flexible and concrete CLI tools. nestjs-commander combines their advantanges together!

## Commander.js
nestjs-eclih utilized [commander.js](https://github.com/tj/commander.js) as CLI driver. All grammers of command and option are excatly same.

## Example

Create a typescript file hello.ts with following:
```ts
import { Module } from "@nestjs/common";
import { CommandProvider, Command, CommanderModule, bootstrapCli } from "nestjs-eclih";

@CommandProvider()
class HelloProvider {

    @Command({
      options: [
        { nameAndArgs: "-n, --name <name>" }
      ]
    })
    hello(options){
        console.log("hello", options.name);
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
  hello [options]
  help [command]  display help for command

$ ts-node hello.ts hello -n husky
hello husky
```

See more examples in [examples](./examples)


## Tutorial

### @CommandProvider
@CommandProvider is a class decorator, it accepts null, a string or a [CommandConfig](#commandconfig)
A null/undefined (which means just `@CommandProvider()`)
A string infers a `CommandConfig` and its `nameAndArgs` is class name.

#### Examples 

```ts
@CommanderProvider()
class SomeClass {}

// So anything under this class will be the subcommand of command hello
@CommanderProvider({
  nameAndArgs: "hello",
  description: "hello's description",
  alias: "h"
})
class SomeClass {}
```

### @Command
@Command is a class methold decorator, it accepts either a string or a [CommandConfig](#commandconfig)
A string infers a `CommandConfig` and its `nameAndArgs` is method name.

#### Examples 

```ts
@CommanderProvider()
class SomeClass {

  @Command({
    // Omit nameAndArgs, since by default it is the method name
    options: [
      { nameAndArgs: "-n, --name <name>" }
    ]
  })
  hello(options){
      console.log("hello", options.name);
  }
}

```
### CommandConfig
```ts
interface CommandConfig {
  nameAndArgs?: string;
  description?: string;
  options?: OptionConfig[];
  alias?: string;
  aliases?: string[];
}
```

### OptionConfig
```ts
interface OptionConfig {
  nameAndArgs: string; 
  description?: string;
  mandatory?: boolean;
  default?: string;
  choices?: string[];
}

```

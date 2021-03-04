import { Module } from "@nestjs/common";
import { CommandProvider } from "../src/command-provider.decorator";
import { Command } from "../src/command.decorator";
import { CommanderModule } from "../src/commander.module";
import { bootstrapCli } from "../src/helper";

class MagicOperation {
    hello(){
        console.log("hello")
    }
}

@CommandProvider()
class HelloProvider {

    constructor(private op: MagicOperation){

    }

    @Command()
    hello(){
        this.op.hello();
    }
}

@Module({
    imports: [
        CommanderModule
    ],
    providers:[
        HelloProvider,
        MagicOperation
    ]
})
export class AppModule {}


bootstrapCli(AppModule);
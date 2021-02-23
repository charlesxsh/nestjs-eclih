
```ts

@Command("abc")
function hello(){

}

@CommandGroup("hello")
@Injectable()
class HelloService {

  @Command("abc")
  function dog(){

  }
}


@Module({
  imports: [CommanderModule]
})
class AppModule {}


// index.ts

bootstrapCLI();
```
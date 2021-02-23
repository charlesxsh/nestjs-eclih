import { CommandMetadata } from "./commander.service";
import { NC_CPROVIDER_CHILD_CMDS } from "./metadatas";


/**
 * Decorator for create a command in commander
 */
export function Command(def?: string): MethodDecorator {
    return function(target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor) {
            const cmdsToProvide: CommandMetadata[] = Reflect.getMetadata(NC_CPROVIDER_CHILD_CMDS, target.constructor) || [];
            cmdsToProvide.push({
                cpTarget: target,
                cpPropertyKey: propertyKey,
                command: {
                    def:def || propertyKey
                }
            })
            Reflect.defineMetadata(NC_CPROVIDER_CHILD_CMDS, cmdsToProvide, target.constructor);
    }
}




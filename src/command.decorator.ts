import { CommandMetadata } from './commander.service';
import { NC_CPROVIDER_CHILD_CMDS } from './metadatas';

export interface CommandConfig {
  name: string;
  description?: string;
  options?: OptionConfig[];
}

export interface OptionConfig {
  flags: string;
  description?: string;
  required?: boolean;
}

/**
 * Decorator for create a command in commander
 */
export function Command(cmdCfg?: CommandConfig): MethodDecorator {
  return function (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) {
    if (!cmdCfg) {
      cmdCfg = {
        name: propertyKey,
      };
    }
    const cmdsToProvide: CommandMetadata[] =
      Reflect.getMetadata(NC_CPROVIDER_CHILD_CMDS, target.constructor) || [];
    cmdsToProvide.push({
      cpTarget: target,
      cpPropertyKey: propertyKey,
      cmdCfg,
    });
    Reflect.defineMetadata(
      NC_CPROVIDER_CHILD_CMDS,
      cmdsToProvide,
      target.constructor,
    );
  };
}

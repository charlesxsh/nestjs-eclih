import { NC_CPROVIDER_CHILD_CMDS } from './metadatas';
import { CommandConfig, CommandMetadata } from './types';

/**
 * Decorator for create a command in commander
 */
export function Command(cmdCfg?: CommandConfig | string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) {
    if (!cmdCfg) {
      cmdCfg = {
        nameAndArgs: propertyKey,
      };
    }

    if (typeof cmdCfg === 'string') {
      cmdCfg = {
        nameAndArgs: cmdCfg,
      };
    }

    if (!cmdCfg.nameAndArgs) {
      cmdCfg.nameAndArgs = propertyKey;
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

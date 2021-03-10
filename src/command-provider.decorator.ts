import 'reflect-metadata';
import { CommanderService } from './commander.service';
import { NC_CPROVIDERS } from './metadatas';
import { CommandConfig, CommandProviderTargetMetadata } from './types';

export function CommandProvider(
  cmdCfg?: CommandConfig | string,
): ClassDecorator {
  return function (target) {
    const targets: CommandProviderTargetMetadata[] =
      Reflect.getMetadata(NC_CPROVIDERS, CommanderService) || [];
    if (typeof cmdCfg === 'string') {
      cmdCfg = {
        nameAndArgs: cmdCfg,
      };
    }

    if (cmdCfg) {
      if (!cmdCfg.nameAndArgs) {
        cmdCfg.nameAndArgs = target.name;
      }
    }

    targets.push({
      target,
      cmdCfg,
    });
    Reflect.defineMetadata(NC_CPROVIDERS, targets, CommanderService);
  };
}

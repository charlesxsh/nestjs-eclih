export type Constructor = new (...args) => any;
export interface CommandConfig {
  nameAndArgs?: string;
  description?: string;
  options?: OptionConfig[];
  alias?: string;
  aliases?: string[];
  provider?: Constructor;
}

export interface OptionConfig {
  nameAndArgs: string;
  description?: string;
  mandatory?: boolean;
  default?: any;
  choices?: string[];
}

export interface CommandProviderTargetMetadata {
  target: any;
  cmdCfg?: CommandConfig;
}

export interface CommandMetadata {
  // Command Provider Target (class)
  cpTarget: any;

  // Command Provider's key (function will be used as command's action)
  cpPropertyKey: any;

  // Command's configuration
  cmdCfg: CommandConfig;
}

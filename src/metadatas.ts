/**
 * Metadata in CommandService
 */

// array, element is command provider's consturctor
export const NC_CPROVIDERS = 'nc:cproviders';

/**
 * Metadata in class marked with '@CommandProvider'
 */

// comamnd provider's subcommands/commands (subcommands if NC_CPROVIDER_CMD defined, otherwise will be add to root command directly)
export const NC_CPROVIDER_CHILD_CMDS = 'nc:cprovider:child:cmds';

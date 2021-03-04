// Metadata in CommandService

// array, element is command provider's consturctor
export const NC_CPROVIDERS = 'nc:cproviders';

// Metadata in @CommandProvider

// comamnd provider itself is a command or just container
export const NC_CPROVIDER_CMD = 'nc:cprovider:cmd';

// comamnd provider's subcommands/commands (subcommands if NC_CPROVIDER_CMD defined, otherwise will be add to root command directly)
export const NC_CPROVIDER_CHILD_CMDS = 'nc:cprovider:child:cmds';

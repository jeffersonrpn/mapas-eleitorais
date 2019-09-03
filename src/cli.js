import arg from 'arg';

import { createMapsFromOptions } from './main';

function parseArgsIntoOptions(rawArgs) {
  const args = arg({
    '--help': Boolean,
    '--ano': Number,
    '--uf': String,
    '-h': '--help',
    '-a': '--ano',
    '-u': '--uf',
  },
  {
    argv: rawArgs
  });
  return {
    ano: args['--ano'] || 2018,
    uf: args['--uf'] || 'AC',
    help: args['--help'] || false
  }
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args);
  await createMapsFromOptions(options);
}

import arg from 'arg';

import { createMapsFromOptions, createMapsFromCSV } from './main';

function parseArgsIntoOptions(rawArgs) {
  const args = arg({
    '--help': Boolean,
    '--ano': Number,
    '--uf': String,
    '--csv': String,
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
    help: args['--help'] || false,
    csv: args['--csv']
  }
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args);
  if (options.csv) {
    await createMapsFromCSV(options);
  } else {
    await createMapsFromOptions(options);
  }
}

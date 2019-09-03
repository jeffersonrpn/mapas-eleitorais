import arg from 'arg';

import { run } from './main';

function parseArgsIntoOptions(rawArgs) {
  const args = arg({
    '--help': Boolean,
    '--cargo': Number,
    '--ano': Number,
    '--uf': String,
    '-h': '--help',
    '-c': '--cargo',
    '-a': '--ano',
    '-u': '--uf',
  },
  {
    argv: rawArgs
  });
  return {
    cargo: args['--cargo'] || 6,
    ano: args['--ano'] || 2018,
    uf: args['--uf'] || 'AC',
    help: args['--help'] || false
  }
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args);
  await run(options);
}

import arg from 'arg';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { createMapsFromOptions, createMapsFromCSV } from "./main";

function parseArgsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--help": Boolean,
      "--ano": Number,
      "--uf": String,
      "--csv": String,
      "-h": "--help",
      "-a": "--ano",
      "-u": "--uf"
    },
    {
      argv: rawArgs
    }
  );
  return {
    ano: args["--ano"],
    uf: args["--uf"],
    help: args["--help"] || false,
    csv: args["--csv"]
  };
}

function promptForMissingOptions(options) {
  return new Promise(resolve => {
    const questions = [];
    if (!options.uf) {
      questions.push({
        type: 'list',
        name: 'uf',
        message: 'Escolha uma Unidade Federativa',
        choices: ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'],
        default: 'AC'
      });
    }
    if (!options.ano) {
      questions.push({
        type: 'number',
        name: 'ano',
        message: 'Qual o ano da eleição?',
        default: 2018
      });
    }
  
    inquirer.prompt(questions).then(answers => {
      resolve({
        ...options,
        uf: options.uf || answers.uf,
        ano: options.ano || answers.ano
      });
    });
  })
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args);
  if (options.help) {
    console.log("\nMapas eleitorais dos Deputados Federais");
    console.log(chalk.yellow("\nComo usar:"));
    console.log(
      "  gerar-mapas-eleitorais --help\t\t\t" + "Mostra essa mensagem"
    );
    console.log(
      "  gerar-mapas-eleitorais --ano <ano da eleição>\t" +
        "Define o ano da eleição"
    );
    console.log(
      "  gerar-mapas-eleitorais --uf <uf>\t\t" +
        "Define o Estado"
    );
    console.log(
      "  gerar-mapas-eleitorais --csv <uf>\t\t" + "Define um filtro por CPF."
    );
    console.log(chalk.yellow("\nExemplos:"));
    console.log(
      "  gerar-mapas-eleitorais --ano 2018 --uf PB\t\t\t" +
        "Gera mapas eleitorais de todos os Deputados Federais da Paraíba nas eleições 2018."
    );
    console.log(
      "  gerar-mapas-eleitorais --ano 2018 --uf PB --csv samples.csv\t" +
        "Gera mapas eleitorais dos Deputados Federais da Paraíba nas eleições 2018 filtrados por sample.csv.\n"
    );
  } else {
    promptForMissingOptions(options).then(newOptions => {
      if (options.csv) {
        createMapsFromCSV(newOptions);
      } else {
        createMapsFromOptions(newOptions);
      }
    })
  }
}

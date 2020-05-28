const argv = require('minimist')(process.argv.slice(2));
import path from 'path';
import chalk from 'chalk';
import clawSync from 'klaw-sync';
const debug = require('debug')('vuemod-import');

interface Options {
  root? : string;
}

function logHelp() {
  console.log(`
Usage: vuemod-import [args] [--options]

Args:
  root                       [string] project directory

Options:
  --help, -h                 [boolean] show help
  --version, -v              [boolean] show version
`)
}

console.log(chalk.cyan(`vuemod-import v${require('./package.json').version}`))
;(async () => {
  const { help, h, version, v } = argv

  if (help || h) {
    logHelp()
    return
  } else if (version || v) {
    return
  }

  const options : Options = {};

  if(argv._ && argv._[0]) {
    options.root = path.isAbsolute(argv._[0]) ? argv._[0] : path.resolve(argv._[0]);
  }
  debug('begin...');
  run(options);
  debug('end...');
})()

async function run(options : Options) {
  try {
    const paths = clawSync(options.root, {filter: filterFn});
    paths.forEach(item => console.log(item.path));
    paths.forEach(item => {
      if(item.path.endsWith('.html')) {
        handleHtml();
      }
      if(item.path.endsWith('.js')) {
        handleJs();
      }
      if(item.path.endsWith('.vue')) {
        handleVue();
      }
    });
  } catch (err) {
    console.log(chalk.red(`[vuemod-import] ${err.message}`));
  }
}

function handleHtml() {

}
function handleJs() {

}
function handleVue() {

}


interface filterOptions {
  nodir? : boolean,
  nofile? : boolean,
  depthLimit? : number,
  fs? : {},
  filter? : ({path, stats}) => boolean,
  traverseAll? : boolean
}

function filterFn({path}) {
  if(/node_modules/.test(path)) {
    return false;
  }
  if(!/.+\.(js|vue|html)$/m.test(path)) {
    return false;
  }
  return true;
}
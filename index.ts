const argv = require('minimist')(process.argv.slice(2));
import path from 'path';
import chalk from 'chalk';
import clawSync from 'klaw-sync';
const debug = require('debug')('vuemod-import');
import resolve from 'resolve';
import { semverLte } from 'semver';
import * as vue2Compiler from 'vue-template-compiler';
import fs from 'fs-extra';

interface UserOptions {
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

  const options : UserOptions = {};

  if(argv._ && argv._[0]) {
    options.root = path.isAbsolute(argv._[0]) ? argv._[0] : path.resolve(argv._[0]);
  }
  debug('begin...');
  run(options);
  debug('end...');
})()

const resolveFrom = (root: string, id: string) =>
  resolve.sync(id, { basedir: root });

let compiler;
function resolveParser(root: string) {
  let pkgPath;
  try {
    pkgPath = resolveFrom(root, 'vue/package.json');
  } catch (err) {
    console.log(chalk.red(`[vuemod-import] ${err.message}`));
  }
  if(pkgPath) {
    const vueVersion = require(pkgPath).version;
    if(vueVersion && semverLte(vueVersion, '3.0.0')) {
      compiler = vue2Compiler; 
    } else {
      // TODO: vue 3 compiler
    }
  }
}

function run(options : UserOptions) {
  try {
    const paths = clawSync(options.root, {filter: filterFn});
    resolveParser(options.root);
    paths.forEach(item => console.log(item.path));
    paths.forEach(({p, stats}) => {
      if(stats.isDirectory()) return;
      if(p.endsWith('.html')) {
        handleHtml();
      }
      if(p.endsWith('.js')) {
        handleJs();
      }
      if(p.endsWith('.vue')) {
        handleVue(p, options);
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
async function handleVue(p: string, options: UserOptions) {
  // compile
  const source = await fs.readFile(p, 'utf-8');
  const descriptor = compiler.parseComponent(source);
  console.log(descriptor);
}


interface filterOptions {
  nodir? : boolean,
  nofile? : boolean,
  depthLimit? : number,
  fs? : {},
  filter? : ({path: string, stats: fs.Stats}): boolean,
  traverseAll? : boolean
}

function filterFn({p}) {
  if(/node_modules/.test(p)) {
    return false;
  }
  if(!/.+\.(js|vue|html)$/m.test(p)) {
    return false;
  }
  return true;
}
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argv = require('minimist')(process.argv.slice(2));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const klaw_sync_1 = __importDefault(require("klaw-sync"));
const debug = require('debug')('vuemod-import');
function logHelp() {
    console.log(`
Usage: vuemod-import [args] [--options]

Args:
  root                       [string] project directory

Options:
  --help, -h                 [boolean] show help
  --version, -v              [boolean] show version
`);
}
console.log(chalk_1.default.cyan(`vuemod-import v${require('./package.json').version}`));
(async () => {
    const { help, h, version, v } = argv;
    if (help || h) {
        logHelp();
        return;
    }
    else if (version || v) {
        return;
    }
    const options = {};
    if (argv._ && argv._[0]) {
        options.root = path_1.default.isAbsolute(argv._[0]) ? argv._[0] : path_1.default.resolve(argv._[0]);
    }
    debug('begin...');
    run(options);
    debug('end...');
})();
async function run(options) {
    try {
        const paths = klaw_sync_1.default(options.root, { filter: filterFn });
        paths.forEach(item => console.log(item.path));
        paths.forEach(item => {
            if (item.path.endsWith('.html')) {
                handleHtml();
            }
            if (item.path.endsWith('.js')) {
                handleJs();
            }
            if (item.path.endsWith('.vue')) {
                handleVue();
            }
        });
    }
    catch (err) {
        console.log(chalk_1.default.red(`[vuemod-import] ${err.message}`));
    }
}
function handleHtml() {
}
function handleJs() {
}
function handleVue() {
}
function filterFn({ path }) {
    if (/node_modules/.test(path)) {
        return false;
    }
    if (!/.+\.(js|vue|html)$/m.test(path)) {
        return false;
    }
    return true;
}

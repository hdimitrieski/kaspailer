'use strict';

let commander = require('commander');
let version = require('../package.json').version;
let extensions = ['.js'];

let transform  = (args) => {
  console.log(args);
  //TODO impl
};

let include = (args) => {
  extensions = args ? args.split(',') : extensions;
};

commander
  .version(version)
  .usage('[options] -t <directory>')
  .option('-t, --transform <directory>', 'path to root directory ex. src/dir')
  .option('-i, --include <...extensions>', 'list of extensions of files to transform (ex. -i .js,.txt')
  .parse(process.argv);

if (commander.include) {
  include(commander.include);
}

if (commander.transform) {
  transform(commander.transform);
} else {
  console.error('Usage: ' + commander.usage());
}
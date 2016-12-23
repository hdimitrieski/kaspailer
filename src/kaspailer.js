let commander = require('commander');
let version = require('../package.json').version;
let _ = require('lodash');
let fs = require('fs');

const readDirectory = require('./traverser/traverser');
const Transformer = require('./transformer/transformer');
const ComponentResolver = require('./resolvers/component-resolver');
const ModuleResolver = require('./resolvers/module-resolver');
const getRootDirectory = require('./common/utils').getRootDirectory;

let includeExtensions = ['.js'];
let excludeExtensions = ['.spec.js'];

commander
  .version(version)
  .usage('[options] -t <directory>')
  .option('-t, --transform <directory>', 'path to root directory ex. src/dir')
  .option('-i, --include <...extensions>', 'list of extensions of files to transform (ex. -i *.js,*.txt')
  .option('-e, --exclude <...extensions>', 'list of extensions of files to exclude (ex. -i *.spec.js,*.txt')
  .parse(process.argv);

const include = (args) => {
  includeExtensions = args ? args.split(',') : includeExtensions;
};

const exclude = (args) => {
  excludeExtensions = args ? args.split(',') : excludeExtensions;
};

let modules = [];
let components = {};

let transform  = (rootPath) => {
  let filesNumber = 0;
  let transformer = new Transformer();
  let componentResolver = new ComponentResolver();
  let moduleResolver = new ModuleResolver();

  readDirectory(rootPath,
    {include: includeExtensions, exclude: excludeExtensions},
    (text, path) => {
      console.log('Resolving: ', path);

      let tokens = componentResolver.resolve(text, path);

      modules = modules.concat(tokens.modules);
     _.forOwn(tokens.components, (val, key) => {
        if (!components[key]) {
          components[key] = [];
        }
        components[key] = components[key].concat(val);
      });

      let transformedText = transformer.parse(tokens, text, path);
      fs.writeFileSync(path, transformedText);
      filesNumber++;
    }
  );

  let resolvedModules = moduleResolver.resolve(modules, components);

  _.forOwn(resolvedModules, (module) => {
    let modulePath = getRootDirectory(module.path) + '/index.js';

    fs.closeSync(fs.openSync(modulePath, 'w'));
    fs.writeFileSync(modulePath,  module.text);
  });

  console.info(_.size(resolvedModules) + ' modules resolved.');
  console.log(filesNumber + ' files processed.');
};

if (commander.transform) {
  include(commander.include);
  exclude(commander.exclude);
  transform(commander.transform);
} else {
  console.error('Usage: ' + commander.usage());
}


let _ = require('lodash');
let resolveRelativeUrl = require('../common/utils').resolveRelativeUrl;

class ModuleResolver {
  constructor() {
  }

  resolve(modules, components) {
    this.resolvedModules = {};
    this.modules = _.filter(modules, (m) => m.dependencies);
    this.components = components;

    this.modules.forEach((module) => {
      console.info('Resolving module: ' + module.name);
      this.resolvedModules[module.name] = {path: module.path, text: this.getText(module)};
    });

    return this.resolvedModules;
  }

  getText(module) {
    let text = '';
    let moduleExportText = '';
    // NOTE @saskodh: sort the angular definitions by type
    let moduleComponents = _.sortBy(this.components[module.name], (c) => c.type);

    moduleExportText += `\nangular.module(\'${module.name}\', [\n`;

    module.dependencies.forEach((d) => {
      // NOTE @saskodh: in case of run or config => pass only the function
      let comp = d.replace(/\.run\(.*,\s/, '.run(').replace(/\.config\(.*,\s/, '.config');
      moduleExportText += `\t\'${comp}\',\n`
    });

    moduleExportText += `])\n`;

    if (!moduleComponents) {
      console.warn('No components are defined for module: ' + module.name);
      return moduleExportText;
    }

    let cmpDefText = '';
    moduleComponents.forEach((cmp) => {
      // NOTE @saskodh: creates correct import path, no matter the platform
      let modulePath = module.path;
      let componentPath = cmp.path.replace('\\\\', '\\').split(/\\|\//).join('/');
      let importPath = resolveRelativeUrl(modulePath, componentPath).replace('.js', '');
      text += `import {${cmp.name}} from \'${importPath}\';\n`;
      cmpDefText += `.${cmp.type}(\'${cmp.name}\', ${cmp.name})\n`;
    });

    text += moduleExportText;
    text += `${cmpDefText};`;

    return text;
  }

}

module.exports = ModuleResolver;
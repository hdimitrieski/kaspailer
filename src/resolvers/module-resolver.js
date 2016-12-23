let _ = require('lodash');

// TODO @saskodh: sort the components when registering to angular (ex. first the directives, then controllers and etc.)
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
    let moduleComponents = this.components[module.name];

    moduleExportText += `\nangular.module(\'${module.name}\', [\n`;

    module.dependencies.forEach((d) => {
      moduleExportText += `\t\'${d}\',\n`
    });

    moduleExportText += `])\n`;

    if (!moduleComponents) {
      console.warn('No components are defined for module: ' + module.name);
      return moduleExportText;
    }

    let cmpDefText = '';
    moduleComponents.forEach((cmp) => {
      text += `import {${cmp.name}} from \'${cmp.path}\';\n`;
      cmpDefText += `.${cmp.type}(\'${cmp.name}\', ${cmp.name})\n`;
    });

    text += moduleExportText;
    text += `${cmpDefText};`;

    return text;
  }

}

module.exports = ModuleResolver;
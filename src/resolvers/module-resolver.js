import _ from 'lodash';

// TODO @saskodh: sort the components when registering to angular (ex. first the directives, then controllers and etc.)
class ModuleResolver {
  constructor() {
  }

  resolve(modules, components) {
    this.resolvedModules = {};
    this.modules = _.filter(modules, (m) => m.dependencies);
    this.components = components;

    this.modules.forEach((module) => {
      this.resolvedModules[module.name] = {path: module.path, text: this.getText(module)};
    });

    return this.resolvedModules;
  }

  getText(module) {
    let text = '';
    let moduleComponents = this.components[module.name];

    if (!moduleComponents) {
      throw new Error('No components are defined for module: ' + module.name);
    }

    let cmpDefText = '';
    moduleComponents.forEach((cmp) => {
      text += `import {${cmp.name}} from \'${cmp.path}\';\n`;
      cmpDefText += `.${cmp.type}(\'${cmp.name}\', ${cmp.name})\n`;
    });

    text += `\nangular.module(\'${module.name}\', [\n`;

    module.dependencies.forEach((d) => {
      text += `\t\'${d}\',\n`
    });

    text += `])\n${cmpDefText};`;

    return text;
  }

}

export default new ModuleResolver();
import _ from 'lodash';
import {ANGULAR_COMPONENT, ANGULAR_CONFIGURATION} from './constants';

class TextParser {
  constructor(componentResolver) {
    this.text = '';
    this.componentResolver = componentResolver;
  }

  parse(txt) {
    this.text = txt;
    this.tokens = this.componentResolver.resolve(txt);
    this.parsedText = '';
    this.index = 0;

    this.parseComponents();
    return this.parsedText.trim().replace(/\n\n+/, '\n');
  }

  parseComponents() {
    this.components = this.getAllElementsSortedByPosition();
    this.functionsToAdd = this.getFunctionsToAdd(this.components);

    while (this.index < this.text.length) {
      let cmp = undefined;
      let change = false;

      if (cmp = this.getFunctionReference()) {
        this.addNgInject(cmp);
      }

      if (cmp = this.getComponentToRemove()) {
        this.remove(cmp);
        change = true;
      }

      if (cmp = this.getFunctionToAdd()) {
        this.addFunctionName(cmp);
        change = true;
      }

      if (cmp = this.getTemplateUrl()) {
        this.replaceTemplateUrl(cmp);
        change = true;
      }

      if (cmp = this.getController()) {
        this.addNgInject(cmp);
      }

      if (!change) {
        this.parsedText += this.text[this.index];
        this.index++;
      }
    }

  }

  getAllElementsSortedByPosition() {
    let components = _.flatten(
      _.concat(
        _.map(this.tokens.components, (val) => val)
      )
    );

    let elementsToRemove = _.map(this.tokens.characters, (el) => {
      el.start = el.index;
      el.end = el.index + 1;
      return el;
    });

    return _.sortBy(_.concat(this.tokens.modules, components, elementsToRemove), 'start');
  }

  getFunctionsToAdd(components) {
    let functions = [];

    _.forEach(components, (cmp) => {
      if (!cmp.hasFnReference && (ANGULAR_COMPONENT[cmp.type] || cmp.type === ANGULAR_CONFIGURATION.config)) {
        functions.push(cmp);
      }
    });

    return functions;
  }

  getFunctionReference() {
    let _function = _.find(this.tokens.functions, (fn) => {
      return fn.start === this.index;
    });

    if (!_function) {
      return undefined;
    }

    let component = _.find(this.tokens.components['my.module'], (cmp) => {
      return cmp.hasFnReference && cmp.functionName === _function.name;
    });

    return component && _function;
  }

  getComponentToRemove() {
    return _.find(this.components, (cmp) => {
      return cmp.start === this.index;
    });
  }

  getFunctionToAdd() {
    return _.find(this.functionsToAdd, (cmp) => {
      return cmp.functionEnd - 8 === this.index;
    });
  }

  getTemplateUrl() {
    return _.find(this.components, (cmp) => {
      return (cmp.type === ANGULAR_COMPONENT.directive || cmp.type === ANGULAR_CONFIGURATION.config)
        && cmp.templateUrlIndex === this.index;
    });
  }

  getController() {
    return _.find(this.functionsToAdd, (cmp) => {
      return (cmp.type === ANGULAR_COMPONENT.directive || cmp.type === ANGULAR_CONFIGURATION.config)
        && cmp.internalControllerIndex === this.index;
    });
  }

  remove(cmp) {
    this.removeComponent(cmp.start, cmp.end);
  }

  removeComponent(start, end) {
    this.index += (end - start);
  }

  addFunctionName(cmp) {
    this.parsedText += '\n/*@ngInject*/\nfunction ' + cmp.name;
    this.index += 9;
    // + 9 - "function" length + 1 increment the index
  }

  replaceTemplateUrl(cmp) {
    let template = 'template: ' + cmp.templateUrl.url;
    this.parsedText += template;
    this.index += template.length;
  }

  addNgInject() {
    this.parsedText += '/*ngInject*/';
    // this.index += 9;
  }
}

export default TextParser;

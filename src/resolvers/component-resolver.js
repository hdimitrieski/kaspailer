let Lexer = require('../lexer/lexer');
const {
  KEYWORDS,
  ANGULAR_COMPONENT,
  ANGULAR,
  MODULE,
  ANGULAR_CONFIGURATION
} = require('../common/constants');


class ComponentResolver {
  constructor() {
    this.lexer = new Lexer();
  }

  /**
   * Resolves all angular components and modules, java script functions and specials characters that should be removed.
   *
   * @param text JavaScript code
   * @param filePath file path
   * @return {Object} resolved objects
   * */
  resolve(text, filePath) {
    this.tokens = this.lexer.lex(text);
    this.filePath = filePath;
    this.functions = [];
    this.modules = [];
    this.components = {};
    this.characters = [];

    while (this.tokens.length > 0) {
      let currentToken = this.peek();

      if (this.isAngularIdentifier(currentToken)) {
        this.resolveAngularIdentifier();
      } else if (this.isVariable(currentToken)) {
        this.resolveVariable();
      } else if (this.isFunction(currentToken)) {
        this.resolveFunction();
      } else {
        this.next();
      }
    }

    return {
      functions: this.functions,
      modules: this.modules,
      components: this.components,
      characters: this.characters
    };
  }

  /**
   * Returns true if the token represents an angular object.
   *
   * @param token the token
   * @return {boolean}
   * */
  isAngularIdentifier(token) {
    return token.identifier && ANGULAR === token.text && this.peekAhead(1, '.')
      && (this.isAngularComponent(this.peekAhead(2)) || this.isAngularModule(this.peekAhead(2)) || this.isAngularConfiguration(this.peekAhead(2)));
  }

  /**
   * Resolves the angular object.
   * */
  resolveAngularIdentifier() {
    let start = this.next().index;
    this.consume('.');

    if (this.isAngularModule(this.peek())) {
      this.resolveModule(start);
    }
  }

  /**
   * Returns true if the token represents a module.
   *
   * @token the token
   * @return {boolean}
   * */
  isAngularModule(token) {
    return MODULE === token.text;
  }

  /**
   * Resolves angular module, its dependencies and the components attached to the module.
   *
   * @param start start position of the angular object
   * ex. .module('m1')
   * */
  resolveModule(start) {
    let elToRemove;
    let module = this.getModule(start);
    this.modules.push(module);
    this.addTokenToRemove(this.peek(';'));
    this.components[module.name] = this.components[module.name] || [];

    while ((elToRemove = this.expect('.')) && this.tokens.length > 0) {
      let nextToken = this.peek();
      this.addTokenToRemove(elToRemove);

      if (this.isAngularComponent(nextToken) || this.isAngularConfiguration(nextToken)) {
        this.resolveComponent(nextToken.text, module.name);
      }
    }
  }

  /**
   * Returns module definition.
   *
   * @param start start position of the module object
   * @return {Object} module definition
   * */
  getModule(start) {
    this.consume(MODULE);
    this.consume('(');
    let moduleNameToken = this.next();

    let module = {
      start: start,
      name: moduleNameToken.value,
      path: this.filePath,
      type: MODULE
    };

    if (this.expect(',')) {
      this.consume('[');
      module.dependencies = this.resolveArguments(']');
      this.consume(']');
    }

    let endToken = this.consume(')');
    module.end = endToken.index;
    this.addTokenToRemove(endToken);
    return module;
  }

  /**
   * Returns true if the token represents an angular component.
   *
   * @param token the token
   * @return {Boolean}
   * */
  isAngularComponent(token) {
    return ANGULAR_COMPONENT[token.text];
  }

  /**
   * Returns true if the token represents an angular configuration (config, run)
   *
   * @param token the token
   * @return {Boolean}
   * */
  isAngularConfiguration(token) {
    return ANGULAR_CONFIGURATION[token.text];
  }

  /**
   * Resolves an angular component.
   *
   * @param cmpType component type (filter, controller, config, constant, ...)
   * @param moduleName the module to which the component is attached
   *
   * ex. .controller('MyController', myController);
   *     .controller('MyController', function () {...})
   *     .config(function () {...});
   *     .run(function () {...});;
   * */
  resolveComponent(cmpType, moduleName) {
    let componentTypeToken = this.consume(cmpType);
    let startDefinitionToken = this.consume('(');
    let cmpNameToken = this.next();
    let endToken = this.peek(',') ? this.consume(',') : startDefinitionToken;

    let component = {
      module: moduleName,
      type: cmpType,
      start: componentTypeToken.index,
      name: cmpNameToken.string ? cmpNameToken.value : undefined,//TODO resolve config/run name
      path: this.filePath
    };

    let cmpDeclarationToken = cmpNameToken.string ? this.next() : cmpNameToken;

    if (this.isAngularConstant(component)) {
      this.addTokenToRemove(endToken);
      this.resolveConstant(component, cmpDeclarationToken);
    } else if (this.isFunction(cmpDeclarationToken)) {
      component.functionEnd = cmpDeclarationToken.index + KEYWORDS.function.length - 1;
      component.hasFnReference = false;
      this.addTokenToRemove(endToken);
      this.resolveComponentInside(component, '(');
    } else if (this.isObjectLiteral(cmpDeclarationToken)) {
      component.object = true;
      this.addTokenToRemove(endToken);
      this.resolveComponentInside(component, '{');
    } else {
      component.hasFnReference = true;
      component.functionName = cmpDeclarationToken.text;
      endToken = this.peekAhead(1, ';');
      if (endToken) {
        this.consume(')');
        this.addTokenToRemove(this.consume(';'));
      } else {
        endToken = this.consume(')');
        this.addTokenToRemove(endToken);
      }
    }

    component.end = endToken.index;
    this.components[moduleName].push(component);
  }

  resolveConstant(component, cmpDeclarationToken) {
    // TODO @saskodh: the constant can be number or concatenated string
    // TODO @saskodh: add semicolon at the end of the constant definition
    if (this.isObjectLiteral(cmpDeclarationToken)) {
      component.object = true;
      this.resolveComponentInside(component, '{');
    } else if (cmpDeclarationToken.text === '[') {
      this.resolveArguments(']');
      this.next();
      this.addTokenToRemove(this.next());
      if (this.peek(';')) {
        this.addTokenToRemove(this.next());
      }
    } else if (cmpDeclarationToken.string) {
      this.addTokenToRemove(this.next());
      if (this.peek(';')) {
        this.addTokenToRemove(this.next());
      }
    }
  }

  /**
   * Resolves the templateUrl and controller that are defined inside the objects such as directives and configs.
   *
   * @param component component definition
   * @param bracket open bracket
   * */
  resolveComponentInside(component, bracket) {
    let stack = [];
    stack.push(bracket);
    let closedBracket = bracket === '(' ? ')' : '}';
    let current = undefined;

    while (stack.length > 0) {
      current = this.next();

      if ((this.isDirective(component) || component.type === ANGULAR_CONFIGURATION.config) && this.peek(':')) {
        if (this.isController(current)) {
          this.consume(':');
          let ctrl = this.next();
          if (ctrl.text === KEYWORDS.function) {
            component.internalControllerIndex = ctrl.index;
          }
        } else if (current.text === 'templateUrl' && !component.templateUrl) {
          // NOTE @saskodh: if templateUrl not yet resolved
          // Didn't had time to debug it why but in some files where that have templateUrl somewhere in the code, it tries to use it
          component.templateUrlIndex = current.index;
          this.consume(':');
          let templateUrlToken = this.next();
          component.templateUrl = templateUrlToken.string && {
              url: templateUrlToken.value,
              index: templateUrlToken.index
            };
        }
      } if (current.text === bracket) {
        stack.push(current.text);
      } else if (current.text === closedBracket) {
        stack.pop();
      }
    }

    current = !component.object ? current : this.next();

    if (current.text === ')') {
      this.addTokenToRemove(current);
    }

    if (this.peek(';')) {
      this.addTokenToRemove(this.consume(';'));
    }
  }

  isObjectLiteral(token) {
    return token.text === '{';
  }

  /**
   * Returns true if the component is directive.
   *
   * @param component the component
   * @return {Boolean}
   * */
  isDirective(component) {
    return ANGULAR_COMPONENT.directive === component.type;
  }

  isAngularConstant(component) {
    // NOTE @saskodh: support for angular.value (same as constant)
    return ANGULAR_COMPONENT.constant === component.type || ANGULAR_COMPONENT.value === component.type;
  }

  /**
   * Returns true if the token is controller.
   *
   * @param token the token
   * @return {Boolean}
   * */
  isController(token) {
    return ANGULAR_COMPONENT.controller === token.text;
  }

  /**
   * Returns true if the token is variable.
   *
   * @param token the token
   * @return {Boolean}
   * */
  isVariable(token) {
    return token.identifier && token.text === KEYWORDS.var && !this.peekAhead(2, ';');
  }

  /**
   * Parses java script functions.
   * ex. var name = something
   *
   * @return {Boolean} boolean true if the variable is parsed successfully
   * */
  resolveVariable() {
    let varToken = this.consume(KEYWORDS.var);
    let varNameToken = this.next();

    if (!this.expect('=') || !varNameToken.identifier) {
      throw new Error('Error while parsing variable. ', varNameToken);
    }

    if (this.isFunction(this.peek())) {
      this.resolveFunction(varNameToken, varToken.index);
      return true;
    }

    return false;
  }

  /**
   * Checks if the token represents a function.
   *
   * @param token the token
   * @return {Boolean} boolean
   * */
  isFunction(token) {
    return token.identifier && token.text === KEYWORDS.function;
  }

  /**
   * Parses function.
   * ex. function name(arg1, arg2, ...?)
   *
   * @param functionNameToken name of the function (ex. stored in var)
   * @param startPosition start position of var keyword.
   * @return {Boolean}
   * */
  resolveFunction(functionNameToken, startPosition) {
    let functionToken = this.consume(KEYWORDS.function);
    functionNameToken = functionNameToken || this.next();

    if (!functionNameToken.identifier) {
      return false;
    }

    this.consume('(');
    let args = this.resolveArguments(')');
    startPosition = startPosition >= 0 ? startPosition : functionToken.index;

    this.functions.push({
      start: startPosition,
      arguments: args,
      name: functionNameToken.text,
      type: KEYWORDS.function
    });

    return true;
  }

  /**
   * Parses array of arguments that are separated with comma.
   *
   * @param endElement the element which indicates end of iteration
   * @return {Array} Array of tokens content
   * */
  resolveArguments(endElement) {
    let args = [];

    if (this.peekToken().text !== endElement) {
      do {
        let arg = this.next();
        args.push(arg.identifier ? arg.text : arg.value);
      } while (this.expect(','));
    }

    return args;
  }

  /**
   * Marks element for removal.
   *
   * @param token the token
   * */
  addTokenToRemove(token) {
    if (!token) {
      return;
    }

    this.characters.push({
      index: token.index,
      element: token.text
    });
  }

  /**
   * Returns the next token and removes it from the list of tokens.
   *
   * @return {Object} token
   * */
  next() {
    return this.tokens.shift();
  }

  /**
   * Returns token. If it is not found, error is thrown.
   *
   * @param el the token that we are expecting to be next
   * @return {Object} next token if that is the token that we are looking for
   * @throws Error if the token is not found
   * */
  consume(el) {
    if (this.tokens.length === 0) {
      throw new Error('Unexpected end', el);
    }

    let token = this.expect(el);

    if (!token) {
      throw new Error('Unexpected element, ' + el, this.peek());
    }

    return token;
  }

  /**
   * Returns next token.
   *
   * @return {Object}
   * */
  peekToken() {
    if (this.tokens.length === 0) {
      throw new Error('Unexpected end.');
    }

    return this.tokens[0];
  }

  /**
   * Returns next token. If parameter is provided, this function will return the next token
   * only if its content is equal with the content of the provided parameter.
   *
   * @param el that we are expecting to be next
   * @return {Boolean | Object} boolean false if the element is not found, otherwise the token
   * */
  peek(el) {
    return this.peekAhead(0, el);
  }

  /**
   * Returns the token on the given position. If second parameter is provided, this function will return the token
   * only if its content is equal with the content of the provided parameter.
   *
   * @param n position of the token that we are looking for
   * @param el that we are expecting to be next
   * @return {Boolean | Object} boolean false if the element is not found, otherwise the token
   * */
  peekAhead(n, el) {
    if (this.tokens.length > n) {
      let token = this.tokens[n];
      return !el || el === token.text ? token : false;
    }

    return false;
  }

  /**
   * Returns the next token if it's content is equal to the content of the element
   * that should be provided to the function and removes the token from the list of tokens.
   *
   * @param el element that we expect to be next.
   * @return {Object} next token
   * */
  expect(el) {
    let token = this.peek(el);
    return token ? this.tokens.shift() : false;
  }

}

module.exports = ComponentResolver;
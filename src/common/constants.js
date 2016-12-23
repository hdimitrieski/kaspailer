const OPERATORS = {
  '+': true,
  '-': true,
  '*': true,
  '%': true,
  '/': true,
  '===': true,
  '!==': true,
  '==': true,
  '!=': true,
  '<': true,
  '>': true,
  '<=': true,
  '>=': true,
  '&&': true,
  '||': true,
  '!': true,
  '=': true,
  '|': true,
  '&': true
};

const ESCAPE = {
  'n': '\n',
  'f': '\f',
  'r': '\r',
  't': '\t',
  'v': '\v',
  '\'': '\'',
  '"': '"'
};

const WHITE_SPACE = {
  ' ': true,
  '\r': true,
  '\t': true,
  '\n': true,
  '\v': true
};

const KEYWORDS = {
  'var': 'var',
  'function': 'function'
};

const MODULE = 'module';

const ANGULAR = 'angular';

// TODO @saskodh: add support for angular.component
const ANGULAR_COMPONENT = {
  'controller': 'controller',
  'directive': 'directive',
  'filter': 'filter',
  'constant': 'constant',
  'service': 'service',
  'factory': 'factory',
  'provider': 'provider',
  'interceptor': 'interceptor'
};

const ANGULAR_CONFIGURATION = {
  'config': 'config',
  'run': 'run'
};

module.exports = {
  OPERATORS,
  ESCAPE,
  WHITE_SPACE,
  KEYWORDS,
  MODULE,
  ANGULAR,
  ANGULAR_COMPONENT,
  ANGULAR_CONFIGURATION
};

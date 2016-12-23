let expect = require('expect');
let Transformer = require('../src/transformer/transformer');
let ComponentResolver = require('../src/resolvers/component-resolver');

describe('transformer', () => {
  let transformer = undefined;
  let componentResolver = undefined;

  beforeEach(() => {
    transformer = new Transformer();
    componentResolver = new ComponentResolver();
  });

  it('should initialize', () => {
    expect(transformer).toExist();
  });

  it('should parse text', () => {
    //given
    let text = 'var MyController = function () {};angular.module("my.module")' +
      '.controller("MyController", MyController);';
    let tokens = componentResolver.resolve(text);

    //when
    let result = transformer.parse(tokens, text);

    //then
    expect(result).toBe('/*ngInject*/var MyController = function () {};\nexport {MyController};');
  });

  it('should parse text 2', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.controller("MyController", function () {})' +
      '.controller("MyController1", function () {})' +
      '.controller("MyController2", function () {});';
    let tokens = componentResolver.resolve(text);

    //when
    let result = transformer.parse(tokens, text);

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function MyController () {}' +
      '\n/*@ngInject*/\n' +
      'function MyController1 () {}' +
      '\n/*@ngInject*/\n' +
      'function MyController2 () {}' +
      '\nexport {MyController, MyController1, MyController2};'
    );
  });

  it('should parse text 3', () => {
    //given
    let text = 'angular.module("my.module").factory("myFactory",function(){})' +
      '.filter("myFilter",function(){})' +
      '.controller("MyController2",function(){});';
    let tokens = componentResolver.resolve(text);

    //when
    let result = transformer.parse(tokens, text);

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function myFactory(){}' +
      '\n/*@ngInject*/\n' +
      'function myFilter(){}' +
      '\n/*@ngInject*/\n' +
      'function MyController2(){}' +
      '\nexport {myFactory, myFilter, MyController2};'
    );
  });

  it('should parse text 4', () => {
    //given
    let text = 'var MyController = function () {};' +
      'angular.module("my.module").controller("MyController", MyController);' +
      '.controller("MyController1", function () {})' +
      '.controller("MyController2", function () {});';
    let tokens = componentResolver.resolve(text);

    //when
    let result = transformer.parse(tokens, text);

    //then
    expect(result).toBe(
      '/*ngInject*/var MyController = function () {};' +
      '\n/*@ngInject*/\n' +
      'function MyController1 () {}' +
      '\n/*@ngInject*/\n' +
      'function MyController2 () {}' +
      '\nexport {MyController, MyController1, MyController2};'
    );
  });

  it('should parse text 5', () => {
    //given
    let text = 'var MyController = function () {};\n' +
      'var myService = function () {};\n' +
      'angular.module("my.module")\n' +
      '.controller("MyController", MyController);\n' +
      '.controller("MyController2", function () {})\n' +
      '.factory("myService", myService);';
    let tokens = componentResolver.resolve(text);

    //when
    let result = transformer.parse(tokens, text);

    //then
    expect(result).toBe(
      '/*ngInject*/var MyController = function () {};\n' +
      '/*ngInject*/var myService = function () {};\n' +
      '/*@ngInject*/\nfunction MyController2 () {}\n' +
      '\nexport {MyController, MyController2, myService};'
    );
  });

  it('should parse text 6', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.directive("myDirective", function () {' +
      'return {' +
        'templateUrl: "src/template.url",' +
        'controller: function () {}' +
      '}' +
      '})';
    let tokens = componentResolver.resolve(text, 'src/main/file.js');

    //when
    let result = transformer.parse(tokens, text, 'src/main/file.js');

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function myDirective () {' +
      'return {template: require(\'../template.url\'),controller: /*ngInject*/function () {}}' +
      '}' +
      '\nexport {myDirective};'
    );
  });

  it('should parse text 7', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.config(function () {' +
        'stateProvider.state({' +
          'templateUrl:\'src/template.url\',' +
          'controller: function () {}' +
        '});' +
      '})';
    let tokens = componentResolver.resolve(text, 'src/file.js');

    //when
    let result = transformer.parse(tokens, text, 'src/file.js');

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function config () {' +
        'stateProvider.state({template: require(\'./template.url\'),controller: /*ngInject*/function () {}});' +
      '}'+
      '\nexport {config};'
    );
  });

  it('should parse text 8', () => {
    //given
    let text = 'angular.module(\'common.service\').constant(\'c1\', {tst: \'test\'});';
    let tokens = componentResolver.resolve(text, 'src/file.js');

    //when
    let result = transformer.parse(tokens, text, 'src/file.js');

    //then
    expect(result).toBe('const c1 = {tst: \'test\'}\nexport {c1};');
  });

  it('should parse text 9', () => {
    //given
    let text = 'angular.module(\'common.service\').constant(\'c2\', [\'test\', \'test1\']);';
    let tokens = componentResolver.resolve(text, 'src/file.js');

    //when
    let result = transformer.parse(tokens, text, 'src/file.js');

    //then
    expect(result).toBe('const c2 = [\'test\', \'test1\']\nexport {c2};');
  });

  it('should parse text 10', () => {
    //given
    let text = 'angular.module(\'common.service\').constant(\'c2\', \'test\');';
    let tokens = componentResolver.resolve(text, 'src/file.js');

    //when
    let result = transformer.parse(tokens, text, 'src/file.js');

    //then
    expect(result).toBe('const c2 = \'test\'\nexport {c2};');
  });

});
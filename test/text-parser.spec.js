import expect from 'expect';
import ComponentResolver from '../src/component-resolver';
import TextParser from '../src/text-parser';

describe('Parser', () => {
  let parser;

  beforeEach(() => {
    parser = new TextParser(new ComponentResolver());
  });

  it('should initialize', () => {
    expect(parser).toExist();
  });

  it('should parse text', () => {
    //given
    let text = 'var MyController = function () {};angular.module("my.module")' +
      '.controller("MyController", MyController);';

    //when
    let result = parser.parse(text);

    //then
    expect(result).toBe('/*ngInject*/var MyController = function () {};');
  });

  it('should parse text 2', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.controller("MyController", function () {})' +
      '.controller("MyController1", function () {})' +
      '.controller("MyController2", function () {});';

    //when
    let result = parser.parse(text);

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function MyController () {}' +
      '\n/*@ngInject*/\n' +
      'function MyController1 () {}' +
      '\n/*@ngInject*/\n' +
      'function MyController2 () {}'
    );
  });

  it('should parse text 3', () => {
    //given
    let text = 'angular.module("my.module").factory("myFactory",function(){})' +
      '.filter("myFilter",function(){})' +
      '.controller("MyController2",function(){});';

    //when
    let result = parser.parse(text);

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function myFactory(){}' +
      '\n/*@ngInject*/\n' +
      'function myFilter(){}' +
      '\n/*@ngInject*/\n' +
      'function MyController2(){}'
    );
  });

  it('should parse text 4', () => {
    //given
    let text = 'var MyController = function () {};' +
      'angular.module("my.module").controller("MyController", MyController);' +
      '.controller("MyController1", function () {})' +
      '.controller("MyController2", function () {});';

    //when
    let result = parser.parse(text);

    //then
    expect(result).toBe(
      '/*ngInject*/var MyController = function () {};' +
      '\n/*@ngInject*/\n' +
      'function MyController1 () {}' +
      '\n/*@ngInject*/\n' +
      'function MyController2 () {}'
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

    //when
    let result = parser.parse(text);

    //then
    expect(result).toBe(
      '/*ngInject*/var MyController = function () {};\n' +
      '/*ngInject*/var myService = function () {};\n' +
      '/*@ngInject*/\nfunction MyController2 () {}'
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

    //when
    let result = parser.parse(text, 'src/main/file.js');

    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function myDirective () {' +
      'return {template: require(\'../template.url\'),controller: /*ngInject*/function () {}}' +
      '}'
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
  
    //when
    let result = parser.parse(text, 'src/file.js');
  
    //then
    expect(result).toBe(
      '/*@ngInject*/\n' +
      'function config () {' +
        'stateProvider.state({template: require(\'./template.url\'),controller: /*ngInject*/function () {}});' +
      '}'
    );
  });
});
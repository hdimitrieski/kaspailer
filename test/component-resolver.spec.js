import expect from 'expect';
import {componentResolver} from '../src/resolvers';

describe('Parser', () => {
  let resolver;

  beforeEach(() => {
    resolver = componentResolver;
  });

  it('should initialize', () => {
    expect(resolver).toExist();
  });

  it('should parse all named functions', () => {
    //given
    let text = 'var myFunction = function (arg1, arg2) {var a = 1;}; \n' +
      'function myFunction2() {}';

    //when
    resolver.resolve(text);

    //then
    let functions = resolver.functions;
    expect(functions.length).toBe(2);

    let f1 = functions[0];
    expect(f1.start).toBe(0);
    expect(f1.arguments.length).toBe(2);
    expect(f1.name).toBe('myFunction');
    expect(f1.type).toBe('function');

    let f2 = functions[1];
    expect(f2.start).toBe(54);
    expect(f2.arguments.length).toBe(0);
    expect(f2.name).toBe('myFunction2');
    expect(f2.type).toBe('function');
  });

  it('should parse all named functions 3', () => {
    //given
    let text = 'var a = 1; function myFunction(arg1) {}';

    //when
    resolver.resolve(text);

    //then
    let functions = resolver.functions;
    expect(functions.length).toBe(1);

    let f1 = functions[0];
    expect(f1.start).toBe(11);
    expect(f1.arguments.length).toBe(1);
    expect(f1.name).toBe('myFunction');
    expect(f1.type).toBe('function');
  });

  it('should parse all named functions 3', () => {
    //given
    let text = 'var a = 1;\n' +
      '/*function myFn1(){}*/\n' +
      'function myFunction/*function myFn(){}*/(arg1)/**/ {}';

    //when
    resolver.resolve(text);

    //then
    let functions = resolver.functions;
    expect(functions.length).toBe(1);

    let f1 = functions[0];
    expect(f1.start).toBe(34);
    expect(f1.arguments.length).toBe(1);
    expect(f1.name).toBe('myFunction');
    expect(f1.type).toBe('function');
  });

  it('should parse all named functions 2', () => {
    //given
    let text = 'function () {var a = 1;};';

    //when
    resolver.resolve(text);

    //then
    let functions = resolver.functions;
    expect(functions.length).toBe(0);
  });

  it('should parse all named functions 4', () => {
    //given
    let text = 'angular.controller("myController", function (arg1) {});';

    //when
    resolver.resolve(text);

    //then
    let functions = resolver.functions;
    expect(functions.length).toBe(0);
  });

  it('should parse angular module that has no dependencies', () => {
    //given
    let text = 'angular.module("my.module", []);';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(2);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');
    expect(m1.start).toBe(0);
    expect(m1.end).toBe(30);
    expect(m1.dependencies).toExist();
    expect(m1.dependencies.length).toBe(0);
  });

  it('should parse all angular modules', () => {
    //given
    let text = 'angular.module("my.module", ["dep1", "dep2"]);';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(2);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');
    expect(m1.start).toBe(0);
    expect(m1.end).toBe(44);
    expect(m1.dependencies.length).toBe(2);
  });

  it('should parse all angular modules 1', () => {
    //given
    let text = 'angular.module("my.module", ["dep1", "dep2"]);' +
      'var a = 1;' +
      'angular.module("my.module");';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(4);

    let modules = resolver.modules;
    expect(modules.length).toBe(2);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');
    expect(m1.start).toBe(0);
    expect(m1.end).toBe(44);
    expect(m1.dependencies).toExist();
    expect(m1.dependencies.length).toBe(2);
    expect(m1.dependencies[0]).toBe('dep1');
    expect(m1.dependencies[1]).toBe('dep2');

    let m2 = modules[1];
    expect(m2.name).toBe('my.module');
    expect(m2.start).toBe(56);
    expect(m2.end).toBe(82);
    expect(m2.dependencies).toNotExist();
  });

  it('should parse all functions and angular modules', () => {
    //given
    let text = 'function myFn1(arg1) {}\n' +
      'angular.module("my.module1", []);\n' +
      'var myFn2 = function (){}\n' +
      'angular.module("my.module2");';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(4);

    let modules = resolver.modules;
    expect(modules.length).toBe(2);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module1');
    expect(m1.dependencies.length).toBe(0);

    let m2 = modules[1];
    expect(m2.name).toBe('my.module2');
    expect(m2.dependencies).toNotExist();

    let functions = resolver.functions;
    expect(functions.length).toBe(2);

    let f1 = functions[0];
    expect(f1.name).toBe('myFn1');
    expect(f1.arguments.length).toBe(1);
    expect(f1.arguments[0]).toBe('arg1');

    let f2 = functions[1];
    expect(f2.name).toBe('myFn2');
    expect(f2.arguments.length).toBe(0);
  });

  it('should parse angular controller declared with function reference', () => {
    //given
    let text = 'angular.module("my.module")' +
      '/*a*/' +
      '.controller("myCtrl", MyCtrl);\n';

    //when
    resolver.resolve(text);

    //then

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.start).toBe(0);
    expect(m1.end).toBe(26);
    expect(m1.name).toBe('my.module');

    let characters = resolver.characters;
    expect(characters.length).toBe(3);

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(1);

    let c1 = components[0];
    expect(c1.type).toBe('controller');
    expect(c1.name).toBe('myCtrl');
    expect(c1.start).toBe(33);
    expect(c1.end).toBe(61);
    expect(c1.hasFnReference).toBe(true);
    expect(c1.functionName).toBe('MyCtrl');
    expect(c1.module).toBe('my.module');
  });

  it('should parse chained angular controllers declared with function reference', () => {
    //given
    let text = 'angular.module("my.module", ["d1"])' +
      '.controller("myCtrl", MyCtrl)' +
      '.controller("myCtrl2", MyCtrl2)\n';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(5);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(2);

    let c1 = components[0];
    expect(c1.type).toBe('controller');
    expect(c1.name).toBe('myCtrl');
    expect(c1.start).toBe(36);
    expect(c1.end).toBe(63);
    expect(c1.hasFnReference).toBe(true);
    expect(c1.functionName).toBe('MyCtrl');
    expect(c1.module).toBe('my.module');

    let c2 = components[1];
    expect(c2.type).toBe('controller');
    expect(c2.name).toBe('myCtrl2');
    expect(c2.start).toBe(65);
    expect(c2.end).toBe(94);
    expect(c2.hasFnReference).toBe(true);
    expect(c2.functionName).toBe('MyCtrl2');
    expect(c2.module).toBe('my.module');
  });

  it('should parse angular controller declared with function', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.controller("myCtrl", function () {' +
      'var a = 1;' +
      '});\n';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(5);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(1);

    let c1 = components[0];
    expect(c1.type).toBe('controller');
    expect(c1.module).toBe('my.module');
    expect(c1.name).toBe('myCtrl');
    expect(c1.start).toBe(28);
    expect(c1.end).toBe(47);
    expect(c1.hasFnReference).toBe(false);
    expect(c1.functionName).toNotExist();
    expect(c1.functionEnd).toBe(56);
  });

  it('should parse angular filter', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.filter("myFilter", function () {});\n';

    //when
    resolver.resolve(text);

    //then

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.start).toBe(0);

    let characters = resolver.characters;
    expect(characters.length).toBe(5);

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(1);

    let c1 = components[0];
    expect(c1.type).toBe('filter');
    expect(c1.name).toBe('myFilter');
    expect(c1.hasFnReference).toBe(false);
    expect(c1.module).toBe('my.module');
  });

  it('should parse angular filter declared with function reference', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.filter("myFilter", myFilter);\n';

    //when
    resolver.resolve(text);

    //then

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.start).toBe(0);

    let characters = resolver.characters;
    expect(characters.length).toBe(3);

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(1);

    let c1 = components[0];
    expect(c1.type).toBe('filter');
    expect(c1.name).toBe('myFilter');
    expect(c1.hasFnReference).toBe(true);
    expect(c1.module).toBe('my.module');
  });

  it('should parse angular provider', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.provider("myProvider", function () {});\n';

    //when
    resolver.resolve(text);

    //then

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.start).toBe(0);

    let characters = resolver.characters;
    expect(characters.length).toBe(5);

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(1);

    let c1 = components[0];
    expect(c1.type).toBe('provider');
    expect(c1.name).toBe('myProvider');
    expect(c1.hasFnReference).toBe(false);
    expect(c1.module).toBe('my.module');
  });

  it('should parse mixed and chained angular controllers', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.controller("myCtrl", function () {' +
      'var a = 1;' +
      '})' +
      '.controller("myCtrl2", function() {})' +
      '.controller("myCtrl3", MyCtrl3);\n';

    //when
    resolver.resolve(text);

    //then
    expect(resolver.characters.length).toBe(9);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let components = resolver.components[m1.name];
    expect(components).toExist();
    expect(components.length).toBe(3);

    let c1 = components[0];
    expect(c1.type).toBe('controller');
    expect(c1.module).toBe('my.module');
    expect(c1.name).toBe('myCtrl');
    expect(c1.start).toBe(28);
    expect(c1.end).toBe(47);
    expect(c1.hasFnReference).toBe(false);
    expect(c1.functionName).toNotExist();
    expect(c1.functionEnd).toBe(56);

    let c2 = components[1];
    expect(c2.type).toBe('controller');
    expect(c2.module).toBe('my.module');
    expect(c2.name).toBe('myCtrl2');
    expect(c2.start).toBe(75);
    expect(c2.end).toBe(95);
    expect(c2.hasFnReference).toBe(false);
    expect(c2.functionName).toNotExist();
    expect(c2.functionEnd).toBe(104);

    let c3 = components[2];
    expect(c3.type).toBe('controller');
    expect(c3.module).toBe('my.module');
    expect(c3.name).toBe('myCtrl3');
    expect(c3.start).toBe(112);
    expect(c3.end).toBe(142);
    expect(c3.hasFnReference).toBe(true);
    expect(c3.functionName).toBe('MyCtrl3');
    expect(c3.functionEnd).toNotExist();
  });

  it('should parse mixed and chained angular components declared in different modules', () => {
    //given
    let text = 'angular.module("my.module1")' +
      '.directive("myDirective", function () {' +
      'return {};' +
      '});' +
      'angular.module("my.module2")' +
      '.controller("myController", MyController)' +
      '.filter("myFilter", myFilterFn);' +
      'angular.module("my.module3", [dep1])' +
      '.factory("myFactory", function () {});';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(15);
    expect(characters[0].element).toBe(')');
    expect(characters[1].element).toBe('.');
    expect(characters[2].element).toBe(',');
    expect(characters[3].element).toBe(')');
    expect(characters[4].element).toBe(';');
    expect(characters[5].element).toBe(')');
    expect(characters[6].element).toBe('.');
    expect(characters[7].element).toBe(')');
    expect(characters[8].element).toBe('.');
    expect(characters[9].element).toBe(';');
    expect(characters[10].element).toBe(')');
    expect(characters[11].element).toBe('.');
    expect(characters[12].element).toBe(',');
    expect(characters[13].element).toBe(')');
    expect(characters[14].element).toBe(';');


    let modules = resolver.modules;
    expect(modules.length).toBe(3);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module1');

    let m2 = modules[1];
    expect(m2.name).toBe('my.module2');

    let m3 = modules[2];
    expect(m3.name).toBe('my.module3');

    let m1Components = resolver.components[m1.name];
    expect(m1Components).toExist();
    expect(m1Components.length).toBe(1);

    let c1 = m1Components[0];
    expect(c1.type).toBe('directive');
    expect(c1.module).toBe('my.module1');
    expect(c1.name).toBe('myDirective');
    expect(c1.hasFnReference).toBe(false);
    expect(c1.functionName).toNotExist();

    let m2Components = resolver.components[m2.name];
    expect(m2Components).toExist();
    expect(m2Components.length).toBe(2);

    let c2 = m2Components[0];
    expect(c2.type).toBe('controller');
    expect(c2.module).toBe('my.module2');
    expect(c2.name).toBe('myController');
    expect(c2.hasFnReference).toBe(true);
    expect(c2.functionName).toBe('MyController');

    let c3 = m2Components[1];
    expect(c3.type).toBe('filter');
    expect(c3.module).toBe('my.module2');
    expect(c3.name).toBe('myFilter');
    expect(c3.hasFnReference).toBe(true);
    expect(c3.functionName).toBe('myFilterFn');

    let m3Components = resolver.components[m3.name];
    expect(m3Components).toExist();
    expect(m3Components.length).toBe(1);

    let c4 = m3Components[0];
    expect(c4.type).toBe('factory');
    expect(c4.module).toBe('my.module3');
    expect(c4.name).toBe('myFactory');
    expect(c4.hasFnReference).toBe(false);
    expect(c1.functionName).toNotExist();
  });

  it('should mark for removing additional elements 1', () => {
    //given
    let text = 'angular.module("my.module", ["d1"])' +
      '.controller("myCtrl", MyCtrl)' +
      '.controller("myCtrl2", MyCtrl2)\n';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);
    expect(characters[0].index).toBe(34);
    expect(characters[1].index).toBe(35);
    expect(characters[2].index).toBe(63);
    expect(characters[3].index).toBe(64);
    expect(characters[4].index).toBe(94);
  });

  it('should mark for removing additional elements 2', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.controller("myCtrl", function () {' +
      'var a = 1;' +
      '});\n';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);
    expect(characters[0].index).toBe(26);
    expect(characters[1].index).toBe(27);
    expect(characters[2].index).toBe(47);
    expect(characters[3].index).toBe(73);
    expect(characters[4].index).toBe(74);
  });

  it('should mark for removing additional elements 3', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.controller("myCtrl", function () {' +
      'var a = 1;' +
      '}).controller("myCtrl2", function() {})' +
      '.controller("myCtrl3", MyCtrl3);\n';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(9);
    expect(characters[0].index).toBe(26);
    expect(characters[1].index).toBe(27);
    expect(characters[2].index).toBe(47);
    expect(characters[3].index).toBe(73);
    expect(characters[4].index).toBe(74);
    expect(characters[5].index).toBe(95);
    expect(characters[6].index).toBe(110);
    expect(characters[7].index).toBe(111);
    expect(characters[8].index).toBe(142);
  });

  it('should parse directives properties - controller and templateUrl', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.directive("myDirective", function () {' +
      'return {' +
      'templateUrl: "src/test",' +
      'controller: function (arg1) {}' +
      '};' +
      '});';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let m1Components = resolver.components[m1.name];
    expect(m1Components).toExist();
    expect(m1Components.length).toBe(1);

    let d1 = m1Components[0];
    expect(d1.name).toBe('myDirective');
    expect(d1.type).toBe('directive');
    expect(d1.hasFnReference).toBe(false);
    expect(d1.functionName).toNotExist();
    expect(d1.internalControllerIndex).toBe(110);
    expect(d1.templateUrlIndex).toBe(74);
    expect(d1.templateUrl.index).toBe(87);
    expect(d1.templateUrl.url).toBe('src/test');
  });

  it('should parse directives properties - controller and templateUrl 2', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.directive("myDirective", function () {' +
      'return {' +
      'templateUrl: "src/test",' +
      'controller: function (arg1) {},' +
      'link: function(scope) {}' +
      '};' +
      '});';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let m1Components = resolver.components[m1.name];
    expect(m1Components).toExist();
    expect(m1Components.length).toBe(1);

    let d1 = m1Components[0];
    expect(d1.name).toBe('myDirective');
    expect(d1.type).toBe('directive');
    expect(d1.hasFnReference).toBe(false);
    expect(d1.functionName).toNotExist();
    expect(d1.internalControllerIndex).toBe(110);
    expect(d1.templateUrlIndex).toBe(74);
    expect(d1.templateUrl.index).toBe(87);
    expect(d1.templateUrl.url).toBe('src/test');
  });

  it('should resolve angular config definitions', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.config(function () {' +
      'var a = 1;' +
      '});\n';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);
    expect(characters[0].element).toBe(')');
    expect(characters[1].element).toBe('.');
    expect(characters[2].element).toBe('(');
    expect(characters[3].element).toBe(')');
    expect(characters[4].element).toBe(';');

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let config = resolver.components[m1.name];
    expect(config).toExist();
    expect(config.length).toBe(1);

    let c1 = config[0];
    expect(c1.start).toBe(28);
    expect(c1.end).toBe(34);
    expect(c1.type).toBe('config');
    expect(c1.module).toBe('my.module');
  });

  it('should resolve angular config definitions and stateProviders config', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.config(function ($stateProvider) {' +
        '$stateProvider.state({' +
          'templateUrl: "url",' +
          'controller: function () {}' +
        '});' +
      '});\n';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);
    expect(characters[0].element).toBe(')');
    expect(characters[1].element).toBe('.');
    expect(characters[2].element).toBe('(');
    expect(characters[3].element).toBe(')');
    expect(characters[4].element).toBe(';');

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let config = resolver.components[m1.name];
    expect(config).toExist();
    expect(config.length).toBe(1);

    let c1 = config[0];
    expect(c1.start).toBe(28);
    expect(c1.end).toBe(34);
    expect(c1.type).toBe('config');
    expect(c1.module).toBe('my.module');
    expect(c1.internalControllerIndex).toExist();
    expect(c1.templateUrlIndex).toExist();
    expect(c1.templateUrl.url).toBe('url');
  });

  it('should resolve angular run definitions', () => {
    //given
    let text = 'angular.module("my.module")' +
      '.run(function () {' +
      'var a = 1;' +
      '});\n';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);
    expect(characters[0].element).toBe(')');
    expect(characters[1].element).toBe('.');
    expect(characters[2].element).toBe('(');
    expect(characters[3].element).toBe(')');
    expect(characters[4].element).toBe(';');

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let config = resolver.components[m1.name];
    expect(config).toExist();
    expect(config.length).toBe(1);

    let c1 = config[0];
    expect(c1.start).toBe(28);
    expect(c1.end).toBe(31);
    expect(c1.type).toBe('run');
    expect(c1.module).toBe('my.module');
  });

  it('should resolve angular constant', () => {
    //given
    let text = 'angular.module("my.module")\n' +
      '.constant("TEST_C", {\n' +
        '"TEST": "test",\n' +
      '});';

    //when
    resolver.resolve(text);

    //then
    let characters = resolver.characters;
    expect(characters.length).toBe(5);
    expect(characters[0].element).toBe(')');
    expect(characters[1].element).toBe('.');
    expect(characters[2].element).toBe(',');
    expect(characters[3].element).toBe(')');
    expect(characters[4].element).toBe(';');

    let modules = resolver.modules;
    expect(modules.length).toBe(1);

    let m1 = modules[0];
    expect(m1.name).toBe('my.module');

    let constants = resolver.components[m1.name];
    expect(constants).toExist();
    expect(constants.length).toBe(1);

    let c1 = constants[0];
    expect(c1.type).toBe('constant');
    expect(c1.module).toBe('my.module');
    expect(c1.name).toBe('TEST_C');
    expect(c1.object).toBe(true);
    expect(c1.start).toBe(29);
    expect(c1.end).toBe(46);
  });

});
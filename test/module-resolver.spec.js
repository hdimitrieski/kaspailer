import expect from 'expect';
import {ModuleResolver} from '../src/module-resolver';

describe('ModuleResolver', () => {
  let moduleResolver;

  beforeEach(() => {
    moduleResolver = new ModuleResolver();
  });

  it('should return text for a given module', () => {
    //given
    let components = {
      'my.module': [{
        type: 'controller',
        name: 'myCtrl',
        path: 'src/test/my-ctrl.js'
      }]
    };

    let modules = [{
      name: 'my.module',
      dependencies: ['my.dep1'],
      path: 'src/test'
    }];

    //when
    let result = moduleResolver.resolve(modules, components);

    //then
    expect(result['my.module'].path).toBe('src/test');
    expect(result['my.module'].text).toBe(
      'import {myCtrl} from \'src/test/my-ctrl.js\';\n' +
      '\n' +
      'angular.module(\'my.module\', [\n' +
      '\t\'my.dep1\',\n' +
      '])\n' +
      '.controller(\'myCtrl\', myCtrl)\n;'
    );
  });

  it('should return texts for a given modules', () => {
    //given
    let components = {
      'my.module': [{
        type: 'controller',
        name: 'myCtrl',
        path: 'src/test/my-ctrl.js'
      }, {
        type: 'factory',
        name: 'myFactory',
        path: 'src/test/my-factory.js'
      }]
    };

    let modules = [{
      name: 'my.module',
      dependencies: ['my.dep1', 'my.dep2'],
      path: 'src/test'
    }];

    //when
    let result = moduleResolver.resolve(modules, components);

    //then
    expect(result['my.module'].path).toBe('src/test');
    expect(result['my.module'].text).toBe(
      'import {myCtrl} from \'src/test/my-ctrl.js\';\n' +
      'import {myFactory} from \'src/test/my-factory.js\';\n' +
      '\n' +
      'angular.module(\'my.module\', [\n' +
      '\t\'my.dep1\',\n' +
      '\t\'my.dep2\',\n' +
      '])\n' +
      '.controller(\'myCtrl\', myCtrl)\n' +
      '.factory(\'myFactory\', myFactory)\n;'
    );
  });

  it('should return text for a given module if the module is declared two times', () => {
    //given
    let components = {
      'my.module': [{
        type: 'controller',
        name: 'myCtrl',
        path: 'src/test/my-ctrl.js'
      }]
    };

    let modules = [{
      name: 'my.module',
      path: 'src/test/test1'
    }, {
      name: 'my.module',
      dependencies: ['my.dep1'],
      path: 'src/test'
    }];

    //when
    let result = moduleResolver.resolve(modules, components);

    //then
    expect(result['my.module'].path).toBe('src/test');
    expect(result['my.module'].text).toBe(
      'import {myCtrl} from \'src/test/my-ctrl.js\';\n' +
      '\n' +
      'angular.module(\'my.module\', [\n' +
      '\t\'my.dep1\',\n' +
      '])\n' +
      '.controller(\'myCtrl\', myCtrl)\n;'
    );
  });

});
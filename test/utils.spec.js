let expect = require('expect');
let {
  resolveFileName,
  resolveRelativePath,
  resolveRelativeUrl,
  getRootDirectory
} = require('../src/common/utils');

describe('Utils', () => {

  it('should throw an error if file name does not exist', () => {
    expect(() => resolveFileName(undefined)).toThrow('File name does not exist undefined');
  });

  it('should return camel case file name', () => {
    //given
    let fileName = 'test-file.js';

    //when
    let result = resolveFileName(fileName);

    //then
    expect(result).toExist();
    expect(result).toBe('testFile');
  });

  it('should return camel case file name 2', () => {
    //given
    let fileName = 'my.test-file_name.js';

    //when
    let result = resolveFileName(fileName);

    //then
    expect(result).toExist();
    expect(result).toBe('myTestFileName');
  });

  it('should return relative path', () => {
    //given
    let rootPath = 'src/';
    let absolutePath = 'src/';

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('./');
  });

  it('should return relative path 2', () => {
    //given
    let rootPath = 'src/';
    let absolutePath = 'src/test';

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('./test/');
  });

  it('should return relative path 3', () => {
    //given
    let rootPath = 'src/test/file';
    let absolutePath = 'src';

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('../../');
  });

  it('should return relative path 4', () => {
    //given
    let rootPath = 'src/test/file';
    let absolutePath = 'src/tst';

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('../../tst/');
  });

  it('should return relative path 5', () => {
    //given
    let rootPath = 'src/test/file';
    let absolutePath = 'src/test/file2';

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('../file2/');
  });

  it('should return relative path 6', () => {
    //given
    let rootPath = 'src/';
    let absolutePath = ['src', 'test', 'file2'];

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('./test/file2/');
  });

  it('should return relative path 7', () => {
    //given
    let rootPath = ['src'];
    let absolutePath = 'src/test/file2/';

    //when
    let result = resolveRelativePath(rootPath, absolutePath);

    //then
    expect(result).toBe('./test/file2/');
  });

  it('should return relative path to file', () => {
    //given
    let rootPath = 'src/file.tpl.html';
    let absolutePath = 'src/test/file2/file.tpl.html';

    //when
    let result = resolveRelativeUrl(rootPath, absolutePath);

    //then
    expect(result).toBe('./test/file2/file.tpl.html');
  });

  it('should get root directory', () => {
    //given
    let path = 'src/main/file.js';

    //when
    let result = getRootDirectory(path);

    //then
    expect(result).toBe('src/main');
  });

});
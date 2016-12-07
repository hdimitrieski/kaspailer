import expect from 'expect';
import {readDirectory} from '../src/file-utils';

describe('FileUtils', () => {

  it('should throw an error if file is not defined', () => {
    expect(() => readDirectory(undefined, {})).toThrow('undefined is not a file');
  });

  it('should throw an error if file is not a directory', () => {
    //given
    let dir = __dirname + '\\file-utils-test\\test3';

    //when
    expect(() => readDirectory(dir, {})).toThrow(dir + ' does not exist');
  });

  it('should read all files in a directory', () => {
    //given
    let dir = __dirname + '\\file-utils-test\\test1';

    //given
    let start = 1;

    //when
    readDirectory(dir, {}, (text, file) => {
      expect(text).toBe('test content ' + start);
      expect(file.includes('\\file-utils-test\\test1')).toBeTruthy();
      expect(file.includes('\\file' + start + '.txt')).toBeTruthy();
      start++;
    });

    expect(start).toBe(5);
  });

  it('should read files with specific extensions in a directory', () => {
    //given
    let dir = __dirname + '\\file-utils-test\\test1';

    //given
    let start = 1;

    //when
    readDirectory(dir, {}, (text, file) => {
      expect(text).toBe('test content ' + start);
      expect(file.includes('\\file-utils-test\\test1')).toBeTruthy();
      expect(file.includes('\\file' + start + '.txt')).toBeTruthy();
      start++;
    });

    expect(start).toBe(5);
  });

  it('should read files with specific extensions in a directory', () => {
    //given
    let dir = __dirname + '\\file-utils-test\\test2';
    let extensions = ['.txt1', '.txt2'];

    //given
    let start = 1;

    //when
    readDirectory(dir, {extensions: extensions}, (text, file) => {
      expect(text).toBe('test content ' + start);
      expect(file.includes('\\file-utils-test\\test2')).toBeTruthy();
      expect(file.includes('\\file' + start + '.txt' + start)).toBeTruthy();
      start++;
    });

    expect(start).toBe(3);
  });

});
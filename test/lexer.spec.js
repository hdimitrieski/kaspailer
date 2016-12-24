let expect = require('expect');
let Lexer = require('../src/lexer/lexer');

describe('Lexer', () => {
  let lexer = undefined;

  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should initialize the lexer', () => {
    expect(lexer).toExist();
  });

  it('should return empty token array for no text', () => {
    //given
    let text = '';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens).toExist();
    expect(tokens.length).toBe(0);
  });

  it('should return empty token array for invalid character', () => {
    //given
    let text = '`';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens).toExist();
    expect(tokens.length).toBe(0);
  });

  it('should return empty token array if no text argument is passed', () => {
    //when
    let tokens = lexer.lex();

    //then
    expect(tokens).toExist();
    expect(tokens.length).toBe(0);
  });

  it('should ignore white spaces', () => {
    //given
    let text = ' \t \n\v \r';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(0);
  });

  it('should return no tokens for single line comments', () => {
    //given
    let text = '//this is comment';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(0);
  });

  it('should return no tokens for single line comments 2', () => {
    //given
    let text = '//th/*is is/ //comm*/ent\n';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(0);
  });

  it('should return no tokens for multi line comments', () => {
    //given
    let text = '/*this/* *i/s ** //comme\n*nt*/';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(0);
  });

  it('should return operator tokens', () => {
    //given
    let text = '+ - = == !== >=';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(6);
    tokens.forEach((token) => {
      expect(token.operator).toBe(true);
    });
  });

  it('should return operator tokens 2', () => {
    //given
    let text = 'a+';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(2);
    expect(tokens[1].operator).toBe(true);
    expect(tokens[1].text).toBe('+');
  });

  it('should return operator tokens 3', () => {
    //given
    let text = 'a>=';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(2);
    expect(tokens[1].text).toBe('>=');
    expect(tokens[1].operator).toBe(true);
  });

  it('should return string tokens starting with \' quote', () => {
    //given
    let text = '\'hello\'';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(1);
    expect(tokens[0].value).toBe('hello');
    expect(tokens[0].text).toBe('\'hello\'');
    expect(tokens[0].index).toBe(0);
  });

  it('should return string tokens starting with \" quote', () => {
    //given
    let text = '\"hello\" \'hi\'';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(2);
    expect(tokens[0].value).toBe('hello');
    expect(tokens[0].text).toBe('\"hello\"');
    expect(tokens[0].index).toBe(0);
    expect(tokens[1].value).toBe('hi');
    expect(tokens[1].text).toBe('\'hi\'');
    expect(tokens[1].index).toBe(8);
  });

  it('should return string tokens starting that contains escape character', () => {
    //given
    let text = '\'hel\\nlo\'';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(1);
    expect(tokens[0].value).toBe('hel\nlo');
    expect(tokens[0].text).toBe('\'hel\\nlo\'');
    expect(tokens[0].index).toBe(0);
    expect(tokens[0].string).toBe(true);
  });

  it('should return string tokens starting that contains invalid escape character', () => {
    //given
    let text = '\'hel\\plo\'';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(1);
    expect(tokens[0].value).toBe('helplo');
    expect(tokens[0].text).toBe('\'hel\\plo\'');
    expect(tokens[0].index).toBe(0);
    expect(tokens[0].string).toBe(true);
  });

  it('should return number tokens', () => {
    //given
    let text = '123 52.4';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(2);
    expect(tokens[0].value).toBe(123);
    expect(tokens[0].index).toBe(0);
    expect(tokens[0].number).toBe(true);

    expect(tokens[1].value).toBe(52.4);
    expect(tokens[1].index).toBe(4);
    expect(tokens[1].number).toBe(true);
  });

  it('should return identifier tokens', () => {
    //given
    let text = 'function angular controller';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(3);
    expect(tokens[0].identifier).toBe(true);
    expect(tokens[0].angularIdentifier).toBe(false);
    expect(tokens[0].text).toBe('function');
    expect(tokens[1].identifier).toBe(true);
    expect(tokens[1].angularIdentifier).toBe(true);
    expect(tokens[1].text).toBe('angular');
    expect(tokens[2].identifier).toBe(true);
    expect(tokens[2].angularIdentifier).toBe(true);
    expect(tokens[2].text).toBe('controller');
  });

  it('should return identifier tokens 2', () => {
    //given
    let text = '_hello $world';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(2);
    expect(tokens[0].identifier).toBe(true);
    expect(tokens[0].angularIdentifier).toBe(false);
    expect(tokens[0].text).toBe('_hello');
    expect(tokens[1].identifier).toBe(true);
    expect(tokens[1].angularIdentifier).toBe(false);
    expect(tokens[1].text).toBe('$world');
  });

  it('should return tokens for java script code', () => {
    //given
    let text = '(function () {\nvar myVar="test1.1";\n})();';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(15);
    expect(tokens[0].text).toBe('(');
    expect(tokens[1].text).toBe('function');
    expect(tokens[1].identifier).toBe(true);
    expect(tokens[1].angularIdentifier).toBe(false);
    expect(tokens[2].text).toBe('(');
    expect(tokens[3].text).toBe(')');
    expect(tokens[4].text).toBe('{');
    expect(tokens[5].text).toBe('var');
    expect(tokens[6].text).toBe('myVar');
    expect(tokens[7].text).toBe('=');
    expect(tokens[8].text).toBe('"test1.1"');
    expect(tokens[9].text).toBe(';');
    expect(tokens[10].text).toBe('}');
    expect(tokens[11].text).toBe(')');
    expect(tokens[12].text).toBe('(');
    expect(tokens[13].text).toBe(')');
    expect(tokens[14].text).toBe(';');
  });

  it('should return tokens for java script code 2', () => {
    //given
    let text = 'var myFunction = function () {}';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(8);
    expect(tokens[0].text).toBe('var');
    expect(tokens[1].text).toBe('myFunction');
    expect(tokens[2].text).toBe('=');
    expect(tokens[3].text).toBe('function');
    expect(tokens[4].text).toBe('(');
    expect(tokens[5].text).toBe(')');
    expect(tokens[6].text).toBe('{');
    expect(tokens[7].text).toBe('}');
  });

  it('should return tokens for java script - angular code', () => {
    //given
    let text = 'angular.module(\'my.module\', [\'my.dependency\'])';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(10);
    expect(tokens[0].text).toBe('angular');
    expect(tokens[0].identifier).toBe(true);
    expect(tokens[0].angularIdentifier).toBe(true);
    expect(tokens[1].text).toBe('.');
    expect(tokens[2].text).toBe('module');
    expect(tokens[2].angularIdentifier).toBe(true);
    expect(tokens[3].text).toBe('(');
    expect(tokens[4].text).toBe('\'my.module\'');
    expect(tokens[5].text).toBe(',');
    expect(tokens[6].text).toBe('[');
    expect(tokens[7].text).toBe('\'my.dependency\'');
    expect(tokens[8].text).toBe(']');
    expect(tokens[9].text).toBe(')');
  });

  it('should return tokens for java script - angular code 2', () => {
    //given
    let text = 'angular.directive(\'myDirective\', function(){\n' +
      'return {\n' +
      'restrict: \'E\', \n' +
      'templateUrl: \'template-url\'\n' +
      '};\n' +
      '});\n';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(24);
    expect(tokens[0].text).toBe('angular');
    expect(tokens[0].angularIdentifier).toBe(true);
    expect(tokens[1].text).toBe('.');
    expect(tokens[2].text).toBe('directive');
    expect(tokens[2].angularIdentifier).toBe(true);
    expect(tokens[3].text).toBe('(');
    expect(tokens[4].text).toBe('\'myDirective\'');
    expect(tokens[5].text).toBe(',');
    expect(tokens[6].text).toBe('function');
    expect(tokens[7].text).toBe('(');
    expect(tokens[8].text).toBe(')');
    expect(tokens[9].text).toBe('{');
    expect(tokens[10].text).toBe('return');
    expect(tokens[11].text).toBe('{');
    expect(tokens[12].text).toBe('restrict');
    expect(tokens[13].text).toBe(':');
    expect(tokens[14].text).toBe('\'E\'');
    expect(tokens[15].text).toBe(',');
    expect(tokens[16].text).toBe('templateUrl');
    expect(tokens[17].text).toBe(':');
    expect(tokens[18].text).toBe('\'template-url\'');
    expect(tokens[19].text).toBe('}');
    expect(tokens[20].text).toBe(';');
    expect(tokens[21].text).toBe('}');
    expect(tokens[22].text).toBe(')');
    expect(tokens[23].text).toBe(';');
  });

  it('should return tokens for js regex', () => {
    //given
    let text = '/"/g';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(1);
    expect(tokens[0].regex).toBe(true);
  });

  it('should return tokens for js regex 2', () => {
    //given
    let text = '/\B(?=(\d{3})+($))/g';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(1);
    expect(tokens[0].regex).toBe(true);
  });

  it('should return tokens', () => {
    //given
    let text = 'resultObject.currentMemory = (currentMemory / 1048576);';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(10);
  });

  it('should return tokens 2', () => {
    //given
    let text = 'scope.orcaMasterForm = ctrls.length > 0 && ctrls[0] ? ctrls[0].getMasterForm() : undefined;';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(26);
  });

  it('should return tokens 3', () => {
    //given
    let text = '\'use strict\'; var a = \'use strict\';';

    //when
    let tokens = lexer.lex(text);

    //then
    expect(tokens.length).toBe(7);
  });

});
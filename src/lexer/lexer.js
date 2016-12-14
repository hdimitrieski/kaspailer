import {
  WHITE_SPACE,
  OPERATORS,
  ESCAPE,
  MODULE,
  ANGULAR,
  ANGULAR_COMPONENT,
  ANGULAR_CONFIGURATION
} from '../common/constants';

class Lexer {
  constructor() {
  }

  lex(text = '') {
    this.text = text;
    this.index = 0;
    this.tokens = [];

    while (this.index < this.text.length) {
      let ch = this.currentCharacter();
      if (ch === '/' && this.peek() === '/') {
        this.readSingleLineComment();
      } else if (ch == '/' && this.peek() === '*') {
        this.readMultiLineComment();
      } else if (ch === '"' || ch === '\'') {
        this.readString(ch);
      } else if (this.isNumber(ch)) {
        this.readNumber();
      } else if (this.isValidIdentifierStart(ch)) {
        this.readIdent();
      } else if (this.is(ch, '(){}[].,;:?')) {
        this.tokens.push({index: this.index, text: ch});
        this.index++;
      } else if (this.isWhitespace(ch)) {
        this.index++;
      } else if (this.isOperator(ch)) {
        this.readOperator()
      } else {
        this.index++;
      }
    }

    return this.tokens;
  }

  readSingleLineComment() {
    this.index += 2;
    let ch = this.currentCharacter();
    while (ch && ch !== '\n') {
      ch = this.nextCharacter();
    }
    this.index++;
  }

  readMultiLineComment() {
    this.index += 2;
    let ch = this.currentCharacter();
    while (ch && (ch !== '*' || this.peek() !== '/')) {
      ch = this.nextCharacter();
    }
    this.index += 2;
  }

  readString(quote) {
    let start = this.index;
    let string = '';
    let rawString = quote;
    let escape = false;
    this.index++;

    while (this.index < this.text.length) {
      let ch = this.currentCharacter();
      rawString += ch;
      if (escape) {
        let rep = ESCAPE[ch];
        string = string + (rep || ch);
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === quote) {
        this.index++;
        this.tokens.push({
          index: start,
          text: rawString,
          value: string,
          string: true
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
  }

  readNumber() {
    let number = '';
    let start = this.index;

    while (this.index < this.text.length) {
      let ch = this.currentCharacter();
      if (ch === '.' || this.isNumber(ch)) {
        number += ch;
      } else {
        break;
      }
      this.index++;
    }

    this.tokens.push({
      index: start,
      text: number,
      number: true,
      value: Number(number)
    });
  }

  readIdent() {
    let start = this.index;

    while (this.index < this.text.length) {
      let ch = this.currentCharacter();
      if (!this.isIdentifier(ch)) {
        break;
      }
      this.index += 1;
    }

    let ident = this.text.slice(start, this.index);

    this.tokens.push({
      index: start,
      text: ident,
      identifier: true,
      angularIdentifier: !!ANGULAR_COMPONENT[ident]
      || ANGULAR === ident
      || MODULE === ident
      || !!ANGULAR_CONFIGURATION[ident]
    });
  }

  readOperator() {
    let ch = this.currentCharacter();
    let ch2 = ch + this.peek();
    let ch3 = ch2 + this.peek(2);
    let op2 = OPERATORS[ch2];
    let op3 = OPERATORS[ch3];
    let token = op3 ? ch3 : (op2 ? ch2 : ch);

    this.tokens.push({index: this.index, text: token, operator: true});
    this.index += token.length;
  }

  is(ch, characters) {
    return characters.indexOf(ch) >= 0;
  }

  isWhitespace(ch) {
    return WHITE_SPACE[ch];
  }

  isValidIdentifierStart(ch) {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || '_' === ch || ch === '$';
  }

  isIdentifier(ch) {
    return this.isValidIdentifierStart(ch) || this.isNumber(ch);
  }

  isNumber(ch) {
    return '0' <= ch && ch <= '9' && typeof ch === 'string';
  }

  isOperator(ch) {
    return OPERATORS[ch];
  }

  peek(n) {
    n = n || 1;
    return this.index + n < this.text.length ? this.text.charAt(this.index + n) : false
  }

  currentCharacter() {
    return this.text.charAt(this.index);
  }

  nextCharacter() {
    let n = this.index + 1;
    let ch = n < this.text.length ? this.text.charAt(n) : undefined;
    if (ch) {
      this.index = n;
    }
    return ch;
  }

}

export default new Lexer();
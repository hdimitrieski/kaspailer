import lexer from './lexer';
import {
  ANGULAR
} from './common/constants';

class ComponentResolver2 {
  constructor() {
  }

  resolve(text) {
    this.tokens = lexer.lex(text);
    this.tree = undefined;

    while (this.tokens.length > 0) {
      let currentToken = this.peek();

      if (this.isAngularIdentifier(currentToken)) {
        this.resolveAngularIdentifier();
      } else {
        this.next();
      }
    }

    return this.tree;
  }

  isAngularIdentifier(token) {
    return token.identifier && ANGULAR === token.text;
  }

  resolveAngularIdentifier() {
    let start = this.next().index;
    this.consume('.');

    if (this.isAngularModule(this.peek())) {
      this.resolveModule(start);
    }
  }

  // util
  next() {
    return this.tokens.shift();
  }

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

  peekToken() {
    if (this.tokens.length === 0) {
      throw new Error('Unexpected end.');
    }

    return this.tokens[0];
  }

  peek(el) {
    return this.peekAhead(0, el);
  }

  peekAhead(n, el) {
    if (this.tokens.length > n) {
      let token = this.tokens[n];
      return !el || el === token.text ? token : false;
    }

    return false;
  }

  expect(el) {
    let token = this.peek(el);
    return token ? this.tokens.shift() : false;
  }
}

export default ComponentResolver2;
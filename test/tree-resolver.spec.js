import expect from 'expect';
import TreeResolver from '../src/tree-resolver';

describe('Parser', () => {
  let resolver;

  beforeEach(() => {
    resolver = new TreeResolver();
  });

  it('should initialize', () => {
    expect(resolver).toExist();
  });

});
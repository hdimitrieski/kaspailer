import expect from 'expect';
import Tree from '../src/Tree';
import Node from '../src/Node';

describe('Tree', () => {

  function angularNode() {
    return new Node({value: {}, type: 'angular'});
  }

  function rootNode() {
    return new Node({value: '.', type: 'root'});
  }

  function cmpNode(cmp) {
    return new Node({value: cmp, type: cmp});
  }

  it('should insert root node properly', () => {
    //given
    let tree = new Tree(new Node({value: {}, type: 'angular'}));

    //then
    expect(tree).toExist();
    expect(tree.root).toExist();
    expect(tree.root.type).toBe('angular');
    expect(tree.root.left).toNotExist();
    expect(tree.root.right).toNotExist();
  });

  it('should insert two root nodes properly', () => {
    //given
    let tree = new Tree(angularNode());
    tree.insertAngularRoot(angularNode());

    //then
    expect(tree).toExist();
    expect(tree.root).toExist();
    expect(tree.root.type).toBe('angular');
    expect(tree.root.left).toExist();
    expect(tree.root.left.type).toBe('angular');
  });

  it('should throw error when adding module to undefined root', () => {
    //given
    let tree = new Tree();

    //then
    expect(() => tree.insertModule(rootNode(), cmpNode('module'))).toThrow('Tree is not defined');
  });

  it('should insert module node properly', () => {
    //given
    let tree = new Tree(angularNode());
    tree.insertModule(rootNode(), cmpNode('module'));

    //then
    expect(tree).toExist();
    expect(tree.root).toExist();
    expect(tree.root.type).toBe('angular');
    expect(tree.root.left).toNotExist();

    let moduleRoot = tree.root.right;
    expect(moduleRoot).toExist();
    expect(moduleRoot.type).toBe('root');

    let module = moduleRoot.right;
    expect(module).toExist();
    expect(module.type).toBe('module');
    expect(module.left).toNotExist();
    expect(module.right).toNotExist();
  });

  it('should insert two modules node properly', () => {
    //given
    let tree = new Tree(angularNode());
    tree.insertModule(rootNode(), cmpNode('module'));
    tree.insertModule(rootNode(), cmpNode('module2'));

    //then
    expect(tree).toExist();
    expect(tree.root).toExist();
    expect(tree.root.type).toBe('angular');
    expect(tree.root.left).toNotExist();

    let moduleRoot = tree.root.right;
    expect(moduleRoot).toExist();
    expect(moduleRoot.type).toBe('root');

    let module = moduleRoot.right;
    expect(module).toExist();
    expect(module.type).toBe('module');

    let moduleRoot2 = moduleRoot.left;
    expect(moduleRoot2).toExist();
    expect(moduleRoot2.type).toBe('root');

    let module2 = moduleRoot2.right;
    expect(module2).toExist();
    expect(module2.type).toExist('module');
  });

  it('should throw error when adding module to undefined root', () => {
    //given
    let tree = new Tree();

    //then
    expect(() => tree.insertComponent(rootNode(), cmpNode('module'))).toThrow('Tree is not defined');
  });

  it('should throw error when adding component to undefined module', () => {
    //given
    let tree = new Tree(angularNode());

    //then
    expect(() => tree.insertComponent(rootNode(), cmpNode('service'))).toThrow('Module is not defined');
  });

  it('should insert component node properly', () => {
    //given
    let tree = new Tree(angularNode());
    tree.insertModule(rootNode(), cmpNode('module'));
    tree.insertComponent(rootNode(), cmpNode('controller'));

    //then
    expect(tree).toExist();
    expect(tree.root).toExist();
    expect(tree.root.type).toBe('angular');
    expect(tree.root.left).toNotExist();

    let moduleRoot = tree.root.right;
    expect(moduleRoot).toExist();
    expect(moduleRoot.type).toBe('root');

    let module = moduleRoot.right;
    expect(module).toExist();
    expect(module.type).toBe('module');

    let ctrlRoot = module.left;
    expect(ctrlRoot).toExist();
    expect(ctrlRoot.type).toBe('root');

    let ctrl = ctrlRoot.right;
    expect(ctrl).toExist();
    expect(ctrl.type).toBe('controller');
  });

  it('should insert two component nodes properly', () => {
    //given
    let tree = new Tree(angularNode());
    tree.insertModule(rootNode(), cmpNode('module'));
    tree.insertComponent(rootNode(), cmpNode('controller'));
    tree.insertComponent(rootNode(), cmpNode('factory'));

    //then
    expect(tree).toExist();
    expect(tree.root).toExist();
    expect(tree.root.type).toBe('angular');

    expect(tree.root.left).toNotExist();

    let moduleRoot = tree.root.right;
    expect(moduleRoot).toExist();
    expect(moduleRoot.type).toBe('root');

    let module = moduleRoot.right;
    expect(module).toExist();
    expect(module.type).toBe('module');

    let ctrlRoot = module.left;
    expect(ctrlRoot).toExist();
    expect(ctrlRoot.type).toBe('root');

    let ctrl = ctrlRoot.right;
    expect(ctrl).toExist();
    expect(ctrl.type).toBe('controller');

    let factoryRoot = ctrlRoot.left;
    expect(factoryRoot).toExist();
    expect(factoryRoot.type).toBe('root');

    let factory = factoryRoot.right;
    expect(factory).toExist();
    expect(factory.type).toBe('factory');
  });

  it('should find component by type', () => {
    //given
    let tree = new Tree(angularNode());
    tree.insertModule(rootNode(), cmpNode('module'));
    tree.insertComponent(rootNode(), cmpNode('controller'));

    //then
    let found = tree.findType('module');
    expect(found).toExist();
    expect(found.type).toBe('module');
  });
});
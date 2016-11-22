class Tree {
  constructor(node) {
    this.root = node;
  }

  root() {
    return this.root;
  }

  insertAngularRoot(node) {
    if (!this.root) {
      this.root = node;
    }

    let chain = this.goLeft(this.root);

    chain.left = node;
    return chain.left;
  }

  insertComponent(root, component) {
    this.checkDefined();
    let chain = this.root;
    root.right = component;

    chain = this.goLeft(chain);

    if (!chain.right) {
      throw new Error('Module is not defined');
    }

    chain = this.goRight(chain);
    chain = this.goLeft(chain);

    chain.left = root;
    return chain.left;
  }

  insertModule(root, module) {
    this.checkDefined();
    let chain = this.root;
    root.right = module;

    chain = this.goLeft(chain);
    if (!chain.right) {
      chain.right = root;
      return chain.right;
    }
    chain = chain.right;
    chain = this.goLeft(chain);

    chain.left = root;
    return chain.left;
  }

  findType(type) {
    this.checkDefined();

    return this.find(type, this.root);
  }

  find(type, node) {
    if (!node) {
      return undefined;
    } else if (node.type === type) {
      return node;
    }

    return this.find(type, node.left) || this.find(type, node.right);
  }

  goLeft(node) {
    let chain = node;

    while (chain.left) {
      chain = chain.left;
    }

    return chain;
  }

  goRight(node) {
    let chain = node;

    while (chain.right) {
      chain = chain.right;
    }

    return chain;
  }

  checkDefined() {
    if (!this.root) {
      throw new Error('Tree is not defined');
    }
  }
}

export default Tree;

class Node {
  constructor(data, left, right) {
    this.value = data.value;
    this.type = data.type;
    this.left = left;
    this.right = right;
  }

  addLeft(node) {
    this.left = node;
  }

  addRight(node) {
    this.right = node;
  }

}

export default Node;
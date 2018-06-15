import { Dictionary } from 'lodash';
import _ = require('lodash');

interface IConfigNodeSearch {
  selections: ConfigNode[];
  cursor: number;
  query: string;
}

export class Configuration {
  public rootNode: ConfigNode;
  private readonly raw: any;
  private flattenedRootNode: Dictionary<ConfigNode> = {};

  constructor(raw: any) {
    this.raw = raw;
    this.rootNode = new ConfigNode(0);

    Object.keys(raw).forEach((key) => {
      this.rootNode.addChild(key, this.raw[key], (child: ConfigNode) => {
        this.flattenedRootNode[child.key] = child;
      });
    });
  }

  public suggest(search: IConfigNodeSearch): Dictionary<ConfigNode> {
    let result = {};
    if (search) {
      let levelNode = this.rootNode;
      let iterations = 0;
      search.selections.forEach((node) => {
        if (iterations++ < search.cursor - 1 && levelNode.children) {
          levelNode = levelNode.children[node.name];
        }
      });
      result = this.recursiveSearch(search.query, levelNode.sortedChildren(), {});
    }
    return result;
  }

  private recursiveSearch(query: string, nodes: Dictionary<ConfigNode>, result: Dictionary<ConfigNode>): Dictionary<ConfigNode> {
    _.each(nodes, (n) => {
      if (_.includes(n.name, query)) {
        if (n.children && _.size(n.children) === 1) {
          this.recursiveSearch('', n.sortedChildren(), result);
        } else {
          result[n.key] = n;
        }
      } else {
        if (n.children) {
          this.recursiveSearch(query, n.sortedChildren(), result);
        }
      }
    });
    return result;
  }
}

export class ConfigNode {
  public parent?: ConfigNode;
  public level: number;
  public name: string;
  public children?: Dictionary<ConfigNode>;
  public key: string;
  public value?: { schema: { type: string, enum?: string[] } };

  constructor(level: number, name?: string, parent?: ConfigNode, key?: string) {
    this.parent = parent;
    this.level = level;
    this.name = name || '';
    if (name && name !== 'general') {
      this.key = key ? key + '.' + name : name;
    }
  }

  public sortedChildren() {
    return _.fromPairs(_.sortBy(_.toPairs(this.children), 0));
  }

  public addChild(key: string, value: any, addToRoot: (child: ConfigNode) => void): void {
    const headsAndTails = ConfigNode.expandKeySegments(key);
    headsAndTails.forEach(({ head, tail }) => {
      if (!this.children) {
        this.children = {};
      }
      const node = this.children[head] || new ConfigNode(this.level + 1, head, this, this.key);
      if (tail && tail.length > 0) {
        node.addChild(tail, value, addToRoot);
        addToRoot(node);
      } else {
        node.value = value;
      }
      this.children[head] = node;
    });
  }

  public getNameFrom(position: ConfigNode): string {
    if (this.parent != null && this.parent !== position) {
      return this.parent.getNameFrom(position) + ' ' + this.name;
    }
    return this.name;
  }

  private static expandKeySegments(key: string): { head: string; tail: string }[] {
    let currIndex = 0;
    let head = '';
    let tail = '';
    const headsAndTails: { head: string, tail: string }[] = [];
    while (currIndex <= key.length) {
      currIndex++;
      if (key[currIndex] === '[') {
        currIndex = currIndex + 1;
        const firstIntStart = currIndex;
        while (key[currIndex] !== '.') {
          currIndex++;
        }
        const firstNumber = parseInt(key.substr(firstIntStart, currIndex - 1), 0);
        currIndex = currIndex + 2;
        const secondIntStart = currIndex;
        while (key[currIndex] !== ']') {
          currIndex++;
        }
        const secondNumber = parseInt(key.substr(secondIntStart, currIndex - 1), 0);
        currIndex++;
        for (let i = firstNumber; i <= secondNumber; i++) {
          const h = '' + key.substring(0, firstIntStart - 1) + '[' + i.toString() + ']';
          const t = '' + key.substring(currIndex + 1, key.length);
          headsAndTails.push({ head: h, tail: t });
        }
        break;
      } else if (key[currIndex] === '.') {
        head = key.substring(0, currIndex);
        tail = key.substring(currIndex + 1, key.length);
        headsAndTails.push({ head, tail });
        break;
      } else if (currIndex === key.length) {
        head = key.substring(0, currIndex);
        headsAndTails.push({ head, tail });
        break;
      }
    }
    return headsAndTails;
  }
}

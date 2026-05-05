import {
  Attribute,
  Element,
  Node,
  Text,
} from "angular-html-parser/lib/compiler/src/ml_parser/ast";

export interface RegExpMatch {
  match: string;
  groups: string[];
  index: number;
}

export interface TemplateInterpolation {
  node: Text;
  matches: RegExpMatch[];
}

export function getInterpolations(rootNodes: Node[]): TemplateInterpolation[] {
  const interpolationMatcher = /\{\{(.*?)\}\}/g;
  return flatDeep(rootNodes)
    .filter(textNodeGuard)
    .map((node) => ({
      node,
      matches: findMatches(node.value, interpolationMatcher),
    }))
    .filter((tempInterpolation) => tempInterpolation.matches.length > 0);
}

/**
 * Collect all property binding names ([prop]="...") used in the selected template.
 * These represent values that must be passed as inputs from the parent component.
 */
export function getPropertyBindings(rootNodes: Node[]): string[] {
  const bindings = new Set<string>();
  flatDeep(rootNodes)
    .filter(elementNodeGuard)
    .forEach((element) => {
      element.attrs
        .filter(attributeNodeGuard)
        .filter((attr) => isPropertyBinding(attr.name))
        .forEach((attr) => {
          const propName = attr.name.slice(1, -1); // strip [ and ]
          bindings.add(propName);
        });
    });
  return Array.from(bindings);
}

function isPropertyBinding(attrName: string): boolean {
  return attrName.startsWith("[") && attrName.endsWith("]");
}

function elementNodeGuard(node: Node): node is Element {
  return node.type === "element";
}

function attributeNodeGuard(node: Node): node is Attribute {
  return node.type === "attribute";
}

function findMatches(context: string, regex: RegExp): RegExpMatch[] {
  const results: RegExpMatch[] = [];
  let currentMatch = regex.exec(context);
  while (currentMatch !== null) {
    const { index } = currentMatch;
    const [match, ...groups] = currentMatch;
    results.push({
      groups,
      index,
      match,
    });
    currentMatch = regex.exec(context);
  }
  return results;
}

function textNodeGuard(node: Node): node is Text {
  return node.type === "text";
}

function flatDeep(nodes: Node[]): Node[] {
  return nodes.reduce(
    (acc, node) => [...acc, node, ...flatDeep(getChildren(node))],
    [] as Node[]
  );
}

function getChildren(node: Node): Node[] {
  return node.type === "element" ? node.children : [];
}

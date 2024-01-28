// @ts-nocheck
import { parse } from "acorn";
import type { Node } from "acorn";
import * as walk from "acorn-walk";
import { generate } from "astring";
import type {
  IdentifierNode,
  ImportDeclaration,
  ImportExpressionNode,
  LiteralNode,
  MemberExpressionNode,
  NewExpressionNode
} from "./acorn.nodes";

const code = `import preact from "preact";
import { bar, bla } from "@foo/bar";
import "./sideeffect.js";

console.log(bla(42));

if (true) {
    import("dynamic.js");
}

browser.tabs.create({url:""});

const a = browser.tabs;
a.query({});

const worker = new Worker("path/to/worker.js");

`;

const ast = parse(code, { ecmaVersion: "latest", sourceType: "module" });

console.log("ast", ast);

const imports = new Set<string>();
const workers = new Set<string>();
const apiUsage = new Set<string>();
const apiUsageCode = new Set<string>();

walk.ancestor(
  ast,
  {
    ImportDeclaration(node: ImportDeclaration) {
      if (node.source.type !== "Literal") {
        console.warn("Unhandled import", node);
        return;
      }
      imports.add(node.source.value);
    },
    ImportExpression(node: ImportExpressionNode) {
      if (node.source.type !== "Literal") {
        console.warn("Unhandled dynamic import", node);
        return;
      }

      imports.add(node.source.value);
    },
    Identifier(node: IdentifierNode, state, ancestors) {
      // TODO: detect WASM
      if (node.name !== "browser" && node.name !== "chrome") {
        return;
      }
      if (
        !match(["CallExpression", "MemberExpression", "MemberExpression", "Identifier"], ancestors)
      ) {
        return;
      }
      const apiScope = ancestors.at(-3) as MemberExpressionNode;
      const apiMethod = ancestors.at(-2) as MemberExpressionNode;

      apiUsage.add(`browser.${apiScope.property.name}.${apiMethod.property.name}`);
      apiUsageCode.add(generate(ancestors.at(-4)));
    },
    NewExpression(node: NewExpressionNode, state, ancestors) {
      if (node.arguments.length === 0 || node.arguments.length > 2) {
        return;
      }
      if (node.callee.type !== "Identifier" || node.callee.name !== "Worker") {
        return;
      }
      const [urlNode, optionsNode] = node.arguments as [LiteralNode, Node];
      if (urlNode.type !== "Literal") {
        console.warn("Unhandled worker.", node);
      }
      workers.add(urlNode.value);
    }
  },
  undefined,
  {}
);

function match(types: Node["type"][], ancestors: Node[]): boolean {
  if (ancestors.length < types.length) {
    return false;
  }
  for (let i = 0; i < types.length; i++) {
    if (ancestors.at(-1 - i).type !== types.at(-1 - i)) {
      return false;
    }
  }
  return true;
}

console.log("imports", imports);
console.log("used APIs", apiUsage);
apiUsageCode.forEach((code) => console.log(code));
console.log("workers", workers);

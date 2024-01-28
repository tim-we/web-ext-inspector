// @ts-nocheck
import { parse } from "acorn";
import type { Node } from "acorn";
import * as walk from "acorn-walk";
import { generate } from "astring";
import type { ImportDeclaration, ImportExpressionNode } from "./acorn.nodes";

const code = `import preact from "preact";
import { bar, bla } from "@foo/bar";
import "./sideeffect.js";

console.log(bla(42));

if (true) {
    import("dynamic.js");
}
`;

const blob = new Blob([`console.log("Hello");`], { type: "text/javascript" });
const moduleUrl = URL.createObjectURL(blob);

const ast = parse(code, { ecmaVersion: "latest", sourceType: "module" });

walk.simple(ast, {
  ImportDeclaration(node: ImportDeclaration) {
    if (node.source.type !== "Literal") {
      console.warn("Unhandled import", node);
      return;
    }
    const requestedUrl = node.source.value;
    node.source.value = moduleUrl;
    node.source.raw = JSON.stringify(moduleUrl);
  },
  ImportExpression(node: ImportExpressionNode) {
    if (node.source.type !== "Literal") {
      console.warn("Unhandled dynamic import", node);
      return;
    }
    const requestedUrl = node.source.value;
    node.source.value = moduleUrl;
    node.source.raw = JSON.stringify(moduleUrl);
  }
});

const updatedCode = generate(ast);
console.log(ast);
console.log(updatedCode);

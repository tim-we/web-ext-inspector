import type { Node } from "acorn";

export type LiteralNode = Node & {
  type: "Literal";
  value: string;
  raw: string;
};
export type ImportDeclaration = Node & {
  type: "ImportDeclaration";
  source: LiteralNode;
};
export type ImportExpressionNode = Node & {
  type: "ImportExpression";
  source: LiteralNode;
};
export type IdentifierNode = Node & { type: "Identifier"; name: string };
export type MemberExpressionNode = Node & {
  type: "MemberExpression";
  object: Node;
  property: IdentifierNode;
};
export type CallExpressionNode = Node & {
  type: "CallExpression";
  callee: Node;
  arguments: Node[];
  optional: boolean;
};
export type NewExpressionNode = Node & {
  type: "NewExpression";
  callee: IdentifierNode;
  arguments: Node[];
};
export type ObjectExpressionNode = Node & {
  type: "ObjectExpression";
  properties: PropertyNode[];
};
export type PropertyNode = Node & { type: "Property"; kind: "init" } & (
    | {
        key: LiteralNode;
        value: Node;
        shorthand: false;
      }
    | {
        key: IdentifierNode;
        shorthand: true;
        value: IdentifierNode;
      }
  );

import { expect, test, describe } from "vitest";
import * as paths from "./paths";

describe("join", () => {
  test("join with single argument", () => {
    expect(paths.join("/a/b/c")).toBe("/a/b/c");
    expect(paths.join("")).toBe("");
    expect(paths.join("/")).toBe("/");
  });

  test("suffix has no effect", () => {
    expect(paths.join("/a/b/c", "d/e")).toBe("/a/b/c/d/e");
    expect(paths.join("/a/b/c/", "d/e")).toBe("/a/b/c/d/e");
  });
});

describe("paths.dirname", () => {
  test("dirname of file in root folder", () => {
    const absolutePath = "/file.txt";
    const dirname = paths.dirname(absolutePath);
    expect(dirname).toBe("/");
  });

  test("dirname of relative but direct path", () => {
    const relativePath = "file.txt";
    const dirname = paths.dirname(relativePath);
    expect(dirname).toBe("");
  });

  test("non-trivial path", () => {
    const filePath = "/a/b/c/def/file.txt";
    const dirname = paths.dirname(filePath);
    expect(dirname).toBe("/a/b/c/def");
  });
});

describe("normalize", () => {
  test("resolve parent", () => {
    expect(paths.normalize("/a/b/c/../d")).toBe("/a/b/d");
    expect(paths.normalize("/a/b/c/../../d")).toBe("/a/d");
    expect(paths.normalize("/a/b/c/../../../d")).toBe("/d");
  });

  test("relative & absolute paths", () => {
    expect(paths.normalize("a/b/c")).toBe("a/b/c");
    expect(paths.normalize("/a/b/c")).toBe("/a/b/c");
    expect(paths.normalize("./a/b/c")).toBe("a/b/c");
  });
});

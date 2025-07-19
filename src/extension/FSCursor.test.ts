import { describe, expect, test } from "vitest";
import { createFileSystem, type FSFolder } from "./FileSystem";
import { createTestFS } from "./FileSystem.test";
import * as FSCursor from "./FSCursor";

describe("within a folder", async () => {
  const fs = await createTestFS(["/a", "/b", "/c", "/d"]);

  test("up and down", () => {
    expect(FSCursor.move(fs, "/b", "ArrowUp").name).toBe("a");
    expect(FSCursor.move(fs, "/b", "ArrowDown").name).toBe("c");
  });

  test("root bounds", () => {
    expect(FSCursor.move(fs, "/a", "ArrowUp").name).toBe("a");
    expect(FSCursor.move(fs, "/d", "ArrowDown").name).toBe("d");
  });
});

describe("across folders", async () => {
  const fs = await createTestFS(["/bar/a", "/bar/b", "/foo/c", "/foo/d"]);

  test("select parent", () => {
    expect(FSCursor.move(fs, "/bar/a", "ArrowUp").name).toBe("bar");
    expect(FSCursor.move(fs, "/foo/c", "ArrowUp").name).toBe("foo");
  });

  test("move into folder", () => {
    expect(FSCursor.move(fs, "/foo", "ArrowUp").name).toBe("b");
    expect(FSCursor.move(fs, "/bar/b", "ArrowDown").name).toBe("foo");
  });
});

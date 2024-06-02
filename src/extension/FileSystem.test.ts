import { expect, test, describe } from "vitest";
import { type FSFolder, createFileSystem } from "./FileSystem";
import type * as zip from "@zip.js/zip.js";

test("insertion smoke test", async () => {
  const fs = await createTestFS(["/a/b/file1.txt", "/a/b/file2.txt", "/manifest.json"]);

  expect(fs.path).toBe("/");
  expect(fs.numFiles).toBe(3);
});

test("get file", async () => {
  const fs = await createTestFS(["/file1.txt", "/a/b/file2.txt", "/a/b/file3.txt"]);

  const file1 = fs.getFile("/file1.txt");
  expect(file1).toBeDefined();
  expect(file1.name).toBe("file1.txt");

  const abFiles = fs.getFiles("/a/b/*");
  expect(abFiles.length).toBe(2);
  expect(abFiles.includes(fs.getFile("/a/b/file2.txt")));

  expect(() => { fs.getFile("does/not/exist", true)}).toThrowError();
  expect(fs.getFile("does/not/exist", false)).not.toBeDefined();
});

async function createTestFS(filePaths: string[]): Promise<FSFolder> {
  const generator = async function* () {
    for (const file of filePaths) {
      yield createFakeZipEntry(file);
    }
    return false;
  };

  return await createFileSystem(generator());
}

function createFakeZipEntry(path: string): zip.Entry {
  return {
    filename: path, // TODO: use basename?
    filenameUTF8: true,
    directory: false,
    compressedSize: 0,
    uncompressedSize: 0,
    encrypted: false
  } as unknown as zip.Entry;
}

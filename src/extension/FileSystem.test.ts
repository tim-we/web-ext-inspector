import { expect, test, describe } from "vitest";
import { createFileSystem } from "./FileSystem";
import type * as zip from "@zip.js/zip.js";

test("insertion", async () => {
  const data = async function* () {
    yield await createFakeZipEntry("/a/b/file1.txt");
    yield await createFakeZipEntry("/a/b/file2.txt");
    yield await createFakeZipEntry("/manifest.json");
    return false;
  };

  const fs = await createFileSystem(data());

  expect(fs.path).toBe("/");
});

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

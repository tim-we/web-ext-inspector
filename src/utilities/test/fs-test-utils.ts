import type * as zip from "@zip.js/zip.js";
import { createFileSystem, type FSFolder } from "../../extension/FileSystem";

export async function createTestFS(filePaths: string[]): Promise<FSFolder> {
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

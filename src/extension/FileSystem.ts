import * as zip from "@zip.js/zip.js";
import prettyBytes from "pretty-bytes";

export type FSNodeDTO = { name: string; size: string } & (
  | { type: "folder"; numFiles: number }
  | { type: "file"; tags: string[] }
);

export abstract class FSNode {
  readonly name: string;
  protected readonly parent: FSFolder | undefined;
  protected byteSize = 0;

  constructor(name: string, parent?: FSFolder) {
    this.name = name;
    this.parent = parent;
  }

  abstract asJSON(): FSNodeDTO;

  get uncompressedSize(): number {
    return this.byteSize;
  }

  get path(): string {
    if (this.parent) {
      const parentPath = this.parent.path;
      return parentPath ? `${parentPath}/${this.name}` : this.name;
    }
    if (this instanceof FSFolder) {
      // This is the root folder.
      return "";
    }
    throw new Error("FS path error.");
  }
}

export class FSFile extends FSNode {
  readonly #zipEntry: zip.Entry;
  readonly #references = new Set<FSFile>();
  readonly #usages = new Set<FSFile>();
  readonly #tags = new Set<string>();
  readonly mimeType: string | undefined;

  constructor(entry: zip.Entry, name: string, parent: FSFolder) {
    super(name, parent);
    this.#zipEntry = entry;
    this.byteSize = entry.uncompressedSize;

    const extension = name.match(/^[^\/:]*\.(\w+)$/)?.at(1) ?? "";
    const fileInfo = knownFileNames[name] ?? knownFileExtensions[extension];

    if (fileInfo) {
      if (fileInfo.tag) {
        this.#tags.add(fileInfo.tag);
      }
      this.mimeType = fileInfo.mime;
    }
  }

  async text(): Promise<string> {
    return this.#zipEntry.getData!(new zip.TextWriter()); // TODO #6
  }

  addTag(tag: string): void {
    this.#tags.add(tag);
  }

  asJSON(): FSNodeDTO {
    return {
      type: "file",
      name: this.name,
      size: prettyBytes(this.byteSize),
      tags: Array.from(this.#tags)
    };
  }

  asBlob(mimeType?: string): Promise<Blob> {
    return this.#zipEntry.getData!(new zip.BlobWriter(mimeType ?? this.mimeType)); // TODO #6
  }
}

export class FSFolder extends FSNode {
  readonly children = new Map<string, FSNode>();
  #files = 0;

  get numFiles(): number {
    return this.#files;
  }

  asJSON(): FSNodeDTO {
    return {
      type: "folder",
      name: this.name,
      size: prettyBytes(this.byteSize),
      numFiles: this.#files
    };
  }

  insertFile(relativePath: string, entry: zip.Entry): FSFile {
    if (entry.directory) {
      throw new Error("Cannot insert directory");
    }

    this.#files++;
    const [name, ...rest] = relativePath.split("/");

    if (rest.length === 0) {
      const file = new FSFile(entry, name, this);
      this.children.set(name, file);
      this.byteSize += entry.uncompressedSize;
      return file;
    }

    let folder = this.children.get(name) as FSFolder | undefined;

    if (!folder) {
      folder = new FSFolder(name, this);
      this.children.set(name, folder);
    }

    return folder.insertFile(rest.join("/"), entry);
  }

  getFile(path: string): FSFile;
  getFile(path: string, required: true): FSFile;
  getFile(path: string, required: false): FSFile | undefined;
  getFile(path: string, required = true): FSFile | undefined {
    const file = this.#getNode(path);

    if (required && file === undefined) {
      throw new Error(`File ${path} not found.`);
    }

    if (!(file instanceof FSFile)) {
      if (required) {
        throw new Error(`${path} is not a file.`);
        // biome-ignore lint/style/noUselessElse: TODO biome bug
      } else {
        return undefined;
      }
    }

    return file;
  }

  getFolder(path: string): FSFolder | undefined {
    if (path === "/" && this.parent === undefined) {
      return this;
    }

    const folder = this.#getNode(path);

    if (!(folder instanceof FSFolder)) {
      return undefined;
    }

    return folder;
  }

  countFiles(nameFilter: RegExp): number {
    let count = 0;

    for (const [name, node] of this.children) {
      if (node instanceof FSFolder) {
        count += node.countFiles(nameFilter);
        continue;
      }
      if (nameFilter.test(name)) {
        count++;
      }
    }

    return count;
  }

  #getNode(path: string): FSNode | undefined {
    const [childName, ...rest] = path.replace(/^\//, "").split("/");

    let node: FSNode | undefined;

    if (childName === "..") {
      node = this.parent;
    } else if (childName === ".") {
      node = this;
    } else {
      node = this.children.get(childName);
    }

    if (rest.length > 0) {
      if (!(node instanceof FSFolder)) {
        return undefined;
      }
      return node.#getNode(rest.join("/"));
    }

    return node;
  }
}

const knownFileExtensions: Record<string, FileTypeInfo> = {
  js: { tag: "code", mime: "text/javascript" },
  mjs: { tag: "code", mime: "text/javascript" },
  json: { tag: "code", mime: "application/json" },
  xml: { tag: "code", mime: "application/xml" },
  html: { tag: "code", mime: "text/html" },
  htm: { tag: "code", mime: "text/html" },
  ttf: { tag: "font", mime: "font/ttf" },
  woff: { tag: "font", mime: "font/woff" },
  woff2: { tag: "font", mime: "font/woff2" },
  svg: { tag: "image", mime: "image/svg+xml" },
  png: { tag: "image", mime: "image/png" },
  jpg: { tag: "image", mime: "image/jpeg" },
  jpeg: { tag: "image", mime: "image/jpeg" },
  gif: { tag: "image", mime: "image/gif" },
  webp: { tag: "image", mime: "image/webp" },
  csv: { tag: "text", mime: "text/csv" },
  css: { tag: "code", mime: "text/css" },
  mp4: { mime: "video/mp4" },
  pdf: { mime: "application/pdf" },
  txt: { tag: "text", mime: "text/plain" },
  md: { tag: "text", mime: "text/plain" },
  wasm: { mime: "application/wasm" }
};

const knownFileNames: Record<string, FileTypeInfo> = {
  README: { tag: "text", mime: "text/plain" },
  LICENSE: { tag: "text", mime: "text/plain" }
};

export async function createFileSystem(
  entries: AsyncGenerator<zip.Entry, boolean>
): Promise<FSFolder> {
  const root = new FSFolder("root");
  for await (const entry of entries) {
    if (entry.directory) {
      // We extract folders from file paths because some zip files
      // do not contain directory entries. We also ignore empty folders.
      continue;
    }

    root.insertFile(entry.filename, entry);
  }
  return root;
}

type FileTypeInfo = { tag?: "text" | "code" | "image" | "font"; mime: string };

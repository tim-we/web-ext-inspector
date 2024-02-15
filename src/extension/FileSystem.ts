import * as zip from "@zip.js/zip.js";
import prettyBytes from "pretty-bytes";
import * as paths from "../utilities/paths";

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

  get root(): FSFolder {
    if (this.parent) {
      return this.parent.root;
    }

    if (!(this instanceof FSFolder)) {
      throw new Error();
    }

    return this;
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

  insertZipEntryAsFile(relativePath: string, entry: zip.Entry): FSFile {
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

    return folder.insertZipEntryAsFile(rest.join("/"), entry);
  }

  getFile(path: string): FSFile;
  getFile(path: string, required: true): FSFile;
  getFile(path: string, required: false): FSFile | undefined;
  getFile(path: string, required = true): FSFile | undefined {
    if (path.includes("*")) {
      throw new Error(`Path "${path}" to file contains unexpected "*".`);
    }

    const files = this.#getNodes(path);

    if (required && files.length === 0) {
      throw new Error(`File ${path} not found.`);
    }

    const [file] = files;

    if (!(file instanceof FSFile)) {
      if (required) {
        throw new Error(`${path} is not a file.`);
      }

      return undefined;
    }

    return file;
  }

  getFiles(path: string): FSFile[] {
    const nodes = this.#getNodes(paths.normalize(path));
    return nodes.filter((node) => node instanceof FSFile) as FSFile[];
  }

  getFolder(path: string): FSFolder | undefined {
    if (path === "/" && this.parent === undefined) {
      return this;
    }

    const [folder] = this.#getNodes(path);

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

  #getNodes(path: string): FSNode[] {
    if (path.startsWith("/")) {
      // Path is absolute.
      return this.root.#getNodes(path.slice(1));
    }

    // Path is relative.
    const [childName, ...rest] = paths.segments(path);

    // Handle wildcards:
    if (childName === "*") {
      const children = [...this.children.values()];

      if (rest.length === 0) {
        return children;
      }

      const restPath = rest.join("/");
      return children
        .filter((node) => node instanceof FSFolder)
        .flatMap((node) => (node as FSFolder).#getNodes(restPath));
    }

    // First path segment is not a wildcard
    // but there are still some special segments we need to check:
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
        return [];
      }
      // Recursive lookup:
      return node.#getNodes(rest.join("/"));
    }

    return node ? [node] : [];
  }
}

const knownFileExtensions: Record<string, FileTypeInfo> = {
  // JavaScript
  js: { tag: "code", mime: "text/javascript" },
  mjs: { tag: "code", mime: "text/javascript" },
  // XML & HTML
  xml: { tag: "code", mime: "application/xml" },
  html: { tag: "code", mime: "text/html" },
  htm: { tag: "code", mime: "text/html" },
  // Fonts
  ttf: { tag: "font", mime: "font/ttf" },
  woff: { tag: "font", mime: "font/woff" },
  woff2: { tag: "font", mime: "font/woff2" },
  // Images
  svg: { tag: "image", mime: "image/svg+xml" },
  png: { tag: "image", mime: "image/png" },
  jpg: { tag: "image", mime: "image/jpeg" },
  jpeg: { tag: "image", mime: "image/jpeg" },
  gif: { tag: "image", mime: "image/gif" },
  webp: { tag: "image", mime: "image/webp" },
  // JSON & CSV
  json: { tag: "code", mime: "application/json" },
  csv: { tag: "text", mime: "text/csv" },
  // CSS
  css: { tag: "code", mime: "text/css" },
  // Audio & Video
  mp3: { tag: "audio", mime: "audio/mpeg" },
  oga: { tag: "audio", mime: "audio/ogg" },
  ogg: { tag: "audio", mime: "audio/ogg" },
  weba: { tag: "audio", mime: "audio/webm" },
  mp4: { mime: "video/mp4" },
  // Documents
  pdf: { mime: "application/pdf" },
  txt: { tag: "text", mime: "text/plain" },
  md: { tag: "text", mime: "text/plain" },
  // WASM
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

    root.insertZipEntryAsFile(entry.filename, entry);
  }
  return root;
}

type FileTypeInfo = {
  tag?: "text" | "code" | "image" | "font" | "audio";
  mime: string;
};

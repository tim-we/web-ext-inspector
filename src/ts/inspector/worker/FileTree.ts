import * as zip from "@zip.js/zip.js";

export type TreeNodeDTO =
    | { name: string; type: "folder"; numFiles: number }
    | { name: string; type: "file"; size: number; tags: string[] };

export abstract class TreeNode {
    public name: string;
    protected parent: TreeFolder | undefined;

    public constructor(name: string, parent?: TreeFolder) {
        this.name = name;
        this.parent = parent;
    }

    public abstract toDTO(): TreeNodeDTO;

    public get path(): string {
        if (this.parent) {
            const parentPath = this.parent.path;
            return parentPath ? parentPath + "/" + this.name : this.name;
        } else if (this instanceof TreeFolder) {
            return "";
        } else {
            return this.name;
        }
    }
}

export class TreeFolder extends TreeNode {
    public children: Map<string, TreeNode> = new Map();
    private fileCount: number = 0;
    private uncompressedSize: number = 0;

    public insertEntry(entry: zip.Entry): void {
        this.insert(entry.filename, entry);
    }

    private insert(relPath: string, entry: zip.Entry): void {
        if (entry.directory) {
            // we extract folders from file paths
            // some zips do not contain directory entries
            return;
        }

        this.fileCount++;
        let parts = relPath.split("/");
        const name = parts.shift()!;

        if (parts.length === 0) {
            const file = new TreeFile(entry, name, this);
            this.children.set(name, file);
            this.uncompressedSize += entry.uncompressedSize;
        } else {
            const folder =
                (this.children.get(name) as TreeFolder) ??
                new TreeFolder(name, this);
            this.children.set(name, folder);
            folder.insert(parts.join("/"), entry);
        }
    }

    public get numFiles(): number {
        return this.fileCount;
    }

    public get byteSize(): number {
        return this.uncompressedSize;
    }

    public get(path: string): TreeNode | undefined {
        if (path === "") {
            return this;
        }

        let parts = path.split("/");
        const name = parts.shift()!;

        let node;

        if (name === "..") {
            node = this.parent;
        } else if (name === ".") {
            node = this;
        } else {
            node = this.children.get(name);
        }

        if (node instanceof TreeFolder && parts.length > 0) {
            return node.get(parts.join("/"));
        }

        return node;
    }

    public getAll(path: string): TreeNode[] {
        if (path === "") {
            return [this];
        }

        let parts = path.split("/");
        const name = parts.shift()!;

        if (name === "*") {
            const children = Array.from(this.children.values());
            const subPath = parts.length > 0 ? parts.join("/") : "*";
            return children.flatMap((c) => {
                if (c instanceof TreeFolder) {
                    return c.getAll(subPath);
                } else {
                    return parts.length > 0 ? [] : c;
                }
            });
        }

        let node;

        if (name === "..") {
            node = this.parent;
        } else if (name === ".") {
            node = this;
        } else {
            node = this.children.get(name);
        }

        if (node instanceof TreeFolder && parts.length > 0) {
            return node.getAll(parts.join("/"));
        } else if (node) {
            return [node];
        } else {
            return [];
        }
    }

    public toDTO(): TreeNodeDTO {
        return { name: this.name, type: "folder", numFiles: this.fileCount };
    }
}

export class TreeFile extends TreeNode {
    public entry: zip.Entry;
    private tags: Set<string> = new Set();

    public constructor(entry: zip.Entry, name: string, parent: TreeFolder) {
        super(name, parent);
        this.entry = entry;

        if (entry.directory) {
            throw new Error(`Entry is a directory: ${entry.filename}`);
        }

        if (entry.encrypted) {
            this.tags.add("encrypted");
        }

        if (/\.(js|jsx|json)$/i.test(name)) {
            this.tags.add("code");
        } else if (/\.(html|htm)$/i.test(name)) {
            this.tags.add("html");
        } else if (/\.(jpg|png|gif|svg)$/i.test(name)) {
            this.tags.add("image");
        } else if (/\.(txt|md)$/i.test(name) || name === "LICENSE") {
            this.tags.add("text");
        } else if (/\.css$/i.test(name)) {
            this.tags.add("stylesheet");
        }
    }

    public addTag(tag: string): void {
        this.tags.add(tag);
    }

    public hasTag(tag: string): boolean {
        return this.tags.has(tag);
    }

    public toDTO(): TreeNodeDTO {
        return {
            name: this.name,
            type: "file",
            size: this.entry.uncompressedSize,
            tags: Array.from(this.tags),
        };
    }

    public getTextContent(): Promise<string> {
        return this.entry.getData!(new zip.TextWriter());
    }
}

export function createFileTree(entries: zip.Entry[]): TreeFolder {
    const root = new TreeFolder("root");
    for (const entry of entries) {
        root.insertEntry(entry);
    }
    return root;
}

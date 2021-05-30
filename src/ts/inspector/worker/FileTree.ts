import { Entry } from "@zip.js/zip.js";

export type TreeNodeDTO =
    | { name: string; type: "folder"; numFiles: number }
    | { name: string; type: "file"; size: number; tags: string[] };

export abstract class TreeNode {
    public name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public abstract toDTO(): TreeNodeDTO;
}

export class TreeFolder extends TreeNode {
    public children: Map<string, TreeNode> = new Map();
    private count: number = 0;

    public insertEntry(entry: Entry): void {
        this.insert(entry.filename, entry);
    }

    private insert(relPath: string, entry: Entry): void {
        this.count++;
        let parts = relPath.split("/");
        const name = parts.shift()!;

        if (parts.length === 0) {
            const file = new TreeFile(entry, name);
            this.children.set(name, file);
        } else {
            const folder =
                (this.children.get(name) as TreeFolder) ?? new TreeFolder(name);
            this.children.set(name, folder);
            folder.insert(parts.join("/"), entry);
        }
    }

    public get numFiles(): number {
        return this.count;
    }

    public get(path: string): TreeNode | undefined {
        if (path === "") {
            return this;
        }

        let parts = path.split("/");
        const node = this.children.get(parts.shift()!);

        if (node instanceof TreeFolder && parts.length > 0) {
            return node.get(parts.join("/"));
        } else {
            return node;
        }
    }

    public toDTO(): TreeNodeDTO {
        return { name: this.name, type: "folder", numFiles: this.count };
    }
}

export class TreeFile extends TreeNode {
    public entry: Entry;
    private tags: Set<string> = new Set();

    public constructor(entry: Entry, name: string) {
        super(name);
        this.entry = entry;

        if (entry.directory) {
            throw new Error(`Entry is a directory: ${entry.filename}`);
        }

        if (/\.(js|jsx|json)$/i.test(name)) {
            this.tags.add("code");
        }
    }

    public addTag(tag: string): void {
        this.tags.add(tag);
    }

    public toDTO(): TreeNodeDTO {
        return {
            name: this.name,
            type: "file",
            size: this.entry.uncompressedSize,
            tags: Array.from(this.tags),
        };
    }
}

export function createFileTree(entries: Entry[]): TreeFolder {
    const root = new TreeFolder("root");
    for (const entry of entries) {
        root.insertEntry(entry);
    }
    return root;
}

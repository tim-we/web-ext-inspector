import { Entry } from "@zip.js/zip.js";

export type TreeNodeDTO = { name: string, type: "folder" | "file" };

export abstract class TreeNode {
    public name: string;
    public abstract readonly type: "folder" | "file";

    public constructor(name: string) {
        this.name = name;
    }

    public toDTO(): TreeNodeDTO {
        return { name: this.name, type: this.type };
    }
}

export class TreeFolder extends TreeNode {
    public children: Map<string, TreeNode> = new Map();
    private count: number = 0;
    public readonly type = "folder";

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
        if(path === "") {
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
}

export class TreeFile extends TreeNode {
    public entry: Entry;
    public readonly type = "file";

    public constructor(entry: Entry, name: string) {
        super(name);
        this.entry = entry;

        if (entry.directory) {
            throw new Error(`Entry is a directory: ${entry.filename}`);
        }
    }
}

export function createFileTree(entries: Entry[]): TreeFolder {
    const root = new TreeFolder("root");
    for (const entry of entries) {
        root.insertEntry(entry);
    }
    return root;
}

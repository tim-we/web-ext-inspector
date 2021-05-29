import { Component } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";

type Props = {
    inspector: Inspector;
    path?: string;
};

export default class FileExplorer extends Component<Props> {
    private data: Map<string, TreeNodeDTO[]>;

    public constructor(props: Props) {
        super(props);
        this.data = new Map();
        const path = props.path ?? "";
        props.inspector.listDirectoryContents(path).then((list) => {
            this.data.set(path, list);
            this.forceUpdate();
        });
    }

    public render() {
        return (
            <div class="file-explorer">
                <FolderView
                    path={this.props.path ?? ""}
                    data={this.data}
                    inspector={this.props.inspector}
                />
            </div>
        );
    }
}

type FVProps = {
    path: string;
    data: Map<string, TreeNodeDTO[]>;
    inspector: Inspector;
};

class FolderView extends Component<FVProps> {
    public render() {
        const data = this.props.data.get(this.props.path);

        if (!data) {
            return null;
        }

        return (
            <ul>
                {data.map((node) => {
                    if (node.type === "file") {
                        return (
                            <li
                                class={isCode(node.name) ? "file code" : "file"}
                            >
                                {node.name}
                            </li>
                        );
                    } else {
                        const folderPath = (
                            this.props.path +
                            "/" +
                            node.name
                        ).replace(/^\//, "");
                        const isOpen = this.props.data.has(folderPath);
                        return (
                            <li class={isOpen ? "folder open" : "folder"}>
                                <a
                                    href={"#/files/" + folderPath}
                                    title={
                                        isOpen
                                            ? "click to collapse"
                                            : "click to expand"
                                    }
                                    onClick={async (e: MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isOpen) {
                                            this.props.data.delete(folderPath);
                                        } else {
                                            const list =
                                                await this.props.inspector.listDirectoryContents(
                                                    folderPath
                                                );
                                            this.props.data.set(
                                                folderPath,
                                                list
                                            );
                                        }
                                        this.forceUpdate();
                                    }}
                                >
                                    {node.name}
                                </a>
                                {isOpen ? (
                                    <FolderView
                                        path={folderPath}
                                        data={this.props.data}
                                        inspector={this.props.inspector}
                                    />
                                ) : null}
                            </li>
                        );
                    }
                })}
            </ul>
        );
    }
}

function isCode(filename: string): boolean {
    return /\.(js|jsx|json)$/i.test(filename);
}

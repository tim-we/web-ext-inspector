import { Component, FunctionComponent } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import prettyBytes from "pretty-bytes";
import FilePreview from "./FilePreview";

type Props = {
    inspector: Inspector;
    path?: string;
};

type State = {
    selectedFile?: {
        path: string;
        node: TreeNodeDTO;
    };
};

type FileSelectHandler = (path: string, node: TreeNodeDTO) => void;

export default class FileExplorer extends Component<Props, State> {
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
                <div class="file-tree">
                    <FolderView
                        path={this.props.path ?? ""}
                        data={this.data}
                        inspector={this.props.inspector}
                        onFileSelect={(path, node) => {
                            this.setState({ selectedFile: { path, node } });
                        }}
                    />
                </div>
                {this.state.selectedFile ? (
                    <FilePreview
                        inspector={this.props.inspector}
                        path={this.state.selectedFile.path}
                        node={this.state.selectedFile.node}
                    />
                ) : null}
            </div>
        );
    }
}

type FVProps = {
    path: string;
    data: Map<string, TreeNodeDTO[]>;
    inspector: Inspector;
    onFileSelect: FileSelectHandler;
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
                    const objPath = (this.props.path + "/" + node.name).replace(
                        /^\//,
                        ""
                    );

                    if (node.type === "file") {
                        return (
                            <FileNodeView
                                path={objPath}
                                node={node}
                                inspector={this.props.inspector}
                                onSelect={this.props.onFileSelect}
                            />
                        );
                    } else {
                        const isOpen = this.props.data.has(objPath);
                        return (
                            <li class={isOpen ? "folder open" : "folder"}>
                                <a
                                    href={"#/files/" + objPath}
                                    title={
                                        isOpen
                                            ? "click to collapse"
                                            : "click to expand"
                                    }
                                    onClick={async (e: MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isOpen) {
                                            this.props.data.delete(objPath);
                                        } else {
                                            const list =
                                                await this.props.inspector.listDirectoryContents(
                                                    objPath
                                                );
                                            this.props.data.set(objPath, list);
                                        }
                                        this.forceUpdate();
                                    }}
                                >
                                    {node.name}
                                </a>
                                {node.numFiles >= 2 ? (
                                    <span class="num-files">
                                        {node.numFiles + " files"}
                                    </span>
                                ) : null}
                                {isOpen ? (
                                    <FolderView
                                        path={objPath}
                                        data={this.props.data}
                                        inspector={this.props.inspector}
                                        onFileSelect={this.props.onFileSelect}
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

type FNVProps = {
    path: string;
    node: TreeNodeDTO;
    inspector: Inspector;
    onSelect: (path: string, node: TreeNodeDTO) => void;
};

class FileNodeView extends Component<FNVProps> {
    public render() {
        const path = this.props.path;
        const node = this.props.node;

        if (node.type === "folder") {
            throw new Error(`Node ${node.name} is not a folder.`);
        }

        const classes = ["file"].concat(node.tags);

        return (
            <li class={classes.join(" ")}>
                <a
                    href={"#/files/" + path}
                    onClick={(e: MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.onSelect(path, node);
                    }}
                >
                    {node.name}
                </a>
                <span class="size">{prettyBytes(node.size)}</span>
                {node.tags.map((tag) => (
                    <FileTag tag={tag} />
                ))}
            </li>
        );
    }
}

type FTProps = { tag: string };

const FileTag: FunctionComponent<FTProps> = (props: FTProps) => {
    const tag = props.tag;
    if (tag === "code") {
        return null;
    }
    return <span class={"tag " + tag}>{tag}</span>;
};

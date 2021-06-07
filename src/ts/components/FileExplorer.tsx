import { Component, createRef } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import prettyBytes from "pretty-bytes";
import FilePreview from "./FilePreview";
import TagList from "./TagList";
import UIBox from "./UIBox";
import { FileSelectListener, TreeFileDTO } from "../types/PackagedFiles";

type Props = {
    inspector: Inspector;
    path?: string;
    onFileOpen: FileSelectListener;
};

type State = {
    selectedFile?: {
        path: string;
        node: TreeFileDTO;
    };
};

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

        this.selectFile = this.selectFile.bind(this);
    }

    private async selectFile(path: string, node: TreeFileDTO): Promise<void> {
        await this.loadAllParents(path);
        this.forceUpdate();
        this.setState({ selectedFile: { path, node } });
    }

    private async loadAllParents(path: string): Promise<void> {
        let folders = path.split("/");
        folders.pop();

        while (folders.length > 0) {
            let folder = folders.join("/");
            const list = await this.props.inspector.listDirectoryContents(
                folder
            );
            this.data.set(folder, list);
            folders.pop();
        }
    }

    public render() {
        return (
            <UIBox
                key="file-explorer"
                title="File Explorer"
                classes={["file-explorer"]}
            >
                <div class="file-tree">
                    <FolderView
                        path={this.props.path ?? ""}
                        data={this.data}
                        inspector={this.props.inspector}
                        onFileSelect={this.selectFile}
                    />
                </div>
                {this.state.selectedFile ? (
                    <FilePreview
                        inspector={this.props.inspector}
                        path={this.state.selectedFile.path}
                        node={this.state.selectedFile.node}
                        closer={() =>
                            this.setState({ selectedFile: undefined })
                        }
                        onFileSelect={this.selectFile}
                        onFileOpen={this.props.onFileOpen}
                    />
                ) : null}
            </UIBox>
        );
    }
}

type FVProps = {
    path: string;
    data: Map<string, TreeNodeDTO[]>;
    inspector: Inspector;
    onFileSelect: FileSelectListener;
};

class FolderView extends Component<FVProps> {
    public render() {
        const data = this.props.data.get(this.props.path);

        if (!data) {
            return null;
        }

        return (
            <ul role="tree">
                {data.map((node) => {
                    const objPath = (this.props.path + "/" + node.name).replace(
                        /^\//,
                        ""
                    );

                    if (node.type === "file") {
                        return (
                            <FileNodeView
                                key={objPath}
                                path={objPath}
                                node={node}
                                inspector={this.props.inspector}
                                onSelect={this.props.onFileSelect}
                            />
                        );
                    } else {
                        const isOpen = this.props.data.has(objPath);
                        return (
                            <li
                                key={objPath}
                                class={isOpen ? "folder open" : "folder"}
                                role="treeitem"
                                aria-expanded={isOpen}
                            >
                                <a
                                    class="folder"
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
    node: TreeFileDTO;
    inspector: Inspector;
    onSelect: FileSelectListener;
    scrollIntoView?: boolean;
};

class FileNodeView extends Component<FNVProps> {
    private ref = createRef<HTMLAnchorElement>();

    componentDidUpdate() {
        if (this.props.scrollIntoView && this.ref.current) {
            this.ref.current.scrollIntoView();
        }
    }

    public render() {
        const path = this.props.path;
        const node = this.props.node;

        //@ts-ignore
        if (node.type === "folder") {
            throw new Error(`Node ${node.name} is not a folder.`);
        }

        const classes = ["file"].concat(node.tags);

        return (
            <li class={classes.join(" ")} role="treeitem">
                <a
                    ref={this.ref}
                    class="file"
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
                <TagList tags={node.tags} />
            </li>
        );
    }
}

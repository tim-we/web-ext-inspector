import { Component } from "preact";
import { TreeFolder, TreeFile, TreeNode } from "../inspector/worker/FileTree";

type Data<T> = {
    data: T;
};

export default class FileTreeView extends Component<Data<TreeFolder>> {
    public render() {
        const root = this.props.data;

        return (
            <div class="file-tree">
                <FolderView data={root} />
            </div>
        );
    }
}

type FolderState = {
    expanded: boolean;
};

class FolderView extends Component<Data<TreeFolder>, FolderState> {
    public constructor(props: Data<TreeFolder>) {
        super(props);
        this.state = { expanded: true };
    }

    public render() {
        return (
            <div>
                <h4>{this.props.data.name}</h4>
                {this.state.expanded ? (
                    <ul>
                        {Array.from(this.props.data.children.values()).map(
                            (child) => (
                                <TreeNodeView data={child} />
                            )
                        )}
                    </ul>
                ) : null}
            </div>
        );
    }
}

class TreeNodeView extends Component<Data<TreeNode>> {
    public render() {
        const element = this.props.data;

        if (element instanceof TreeFolder) {
            return <FolderView data={element} />;
        } else {
            //TODO
            return null;
        }
    }
}

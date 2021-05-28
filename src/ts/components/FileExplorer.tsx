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
                <FolderView path={this.props.path ?? ""} data={this.data} />
            </div>
        );
    }
}

type FVProps = {
    path: string;
    data: Map<string, TreeNodeDTO[]>;
};

class FolderView extends Component<FVProps> {
    public render() {
        const data = this.props.data.get(this.props.path);

        if(!data) {
            return null;
        }

        return (
            <ul>
                {data.map((node) => {
                    if (node.type === "file") {
                        return <li>{node.name}</li>;
                    } else {
                        return (
                            <li>
                                {node.name}
                                <FolderView
                                    path={this.props.path + "/" + node.name}
                                    data={this.props.data}
                                />
                            </li>
                        );
                    }
                })}
            </ul>
        );
    }
}

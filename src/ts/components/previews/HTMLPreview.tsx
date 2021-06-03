import { Component } from "preact";
import { Inspector } from "../../inspector/Inspector";
import { TreeNodeDTO } from "../../inspector/worker/FileTree";

type Props = {
    path: string;
    name: string;
    inspector: Inspector;
    onFileSelect: FileSelectListener;
};

type State = {
    references?: ScriptInfo[];
};

type ScriptInfo = {
    path: string;
    node: TreeNodeDTO;
};

type FileSelectListener = (path: string, file: TreeNodeDTO) => void;

export default class HTMLPreview extends Component<Props, State> {
    componentWillMount() {
        this.props.inspector
            .analyzeHTML(this.props.path)
            .then(({ scripts }) => {
                this.setState({ references: scripts });
            });
    }

    public render() {
        if (this.state.references !== undefined) {
            return (
                <div class="referenced-scripts">
                    <b>Scripts</b>
                    <ul>
                        {this.state.references.map(({ path, node }) => (
                            <li key={path}>
                                <a
                                    class="file"
                                    href={"#/files/" + path}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        this.props.onFileSelect(path, node);
                                    }}
                                >
                                    {node.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        } else {
            return null;
        }
    }
}

import { Component, FunctionComponent } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import prettyBytes from "pretty-bytes";
import { startDownload } from "../utils/download";
import TagList from "./TagList";

type FPProps = {
    path: string;
    node: TreeNodeDTO;
    inspector: Inspector;
};

const FilePreview: FunctionComponent<FPProps> = (props) => {
    const node = props.node;

    if (node.type === "folder") {
        return null;
    }

    return (
        <div class="file-preview">
            <div>
                <table>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <td>{node.name}</td>
                        </tr>
                        {node.name !== props.path ? (
                            <tr>
                                <th>Path</th>
                                <td>{props.path}</td>
                            </tr>
                        ) : null}
                        <tr>
                            <th>Size</th>
                            <td>{prettyBytes(node.size)}</td>
                        </tr>
                    </tbody>
                </table>
                <TagList tags={node.tags} showAll={true} />
            </div>
            <ContentPreview
                key={props.path}
                path={props.path}
                file={node}
                inspector={props.inspector}
            />
            <a
                class="download"
                title="Download file"
                href={"#/files/" + props.path}
                onClick={async (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = await props.inspector.getFileDownloadURL(
                        props.path
                    );
                    startDownload(url, node.name);
                }}
            >
                Download
            </a>
        </div>
    );
};

export default FilePreview;

type CPProps = {
    path: string;
    file: TreeNodeDTO;
    inspector: Inspector;
};

const ContentPreview: FunctionComponent<CPProps> = (props) => {
    const file = props.file;

    if (file.type === "folder") {
        return null;
    }

    if (file.tags.includes("image")) {
        return (
            <div class="content-preview">
                <ImagePreview
                    path={props.path}
                    name={file.name}
                    inspector={props.inspector}
                />
            </div>
        );
    }

    return null;
};

type IPProps = {
    path: string;
    name: string;
    inspector: Inspector;
};

type IPState = {
    dataURL?: string;
};

class ImagePreview extends Component<IPProps, IPState> {
    componentWillMount() {
        this.props.inspector
            .getFileDownloadURL(this.props.path, 0.0)
            .then((dataURL) => this.setState({ dataURL }));
    }

    componentWillUnmount() {
        if (this.state.dataURL) {
            URL.revokeObjectURL(this.state.dataURL);
        }
    }

    public render() {
        if (this.state.dataURL) {
            return (
                <div class="image-preview">
                    <img
                        src={this.state.dataURL}
                        alt={this.props.name}
                        decoding="async"
                    />
                </div>
            );
        } else {
            return null;
        }
    }
}

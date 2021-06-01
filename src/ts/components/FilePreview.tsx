import { Component } from "preact";
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

export default class FilePreview extends Component<FPProps> {
    public render() {
        const props = this.props;
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
                            <tr>
                                <th>Size</th>
                                <td>{prettyBytes(node.size)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <TagList tags={node.tags} showAll={true} />
                </div>
                <a
                    class="download"
                    title="Download file"
                    href={"#/files/" + props.path}
                    onClick={async (e: MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url =
                            await this.props.inspector.getFileDownloadURL(
                                props.path
                            );
                        startDownload(url, node.name);
                    }}
                >
                    Download
                </a>
            </div>
        );
    }
}

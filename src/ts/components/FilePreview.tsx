import { FunctionComponent } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import prettyBytes from "pretty-bytes";
import { startDownload } from "../utils/download";
import TagList from "./TagList";
import ImagePreview from "./previews/ImagePreview";
import HTMLPreview from "./previews/HTMLPreview";

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
    } else if (file.tags.includes("html")) {
        return (
            <div class="content-preview">
                <HTMLPreview
                    path={props.path}
                    name={file.name}
                    inspector={props.inspector}
                />
            </div>
        );
    }

    return null;
};

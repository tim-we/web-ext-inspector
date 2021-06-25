import { FunctionComponent } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import prettyBytes from "pretty-bytes";
import { startDownload } from "../utils/download";
import TagList from "./TagList";
import ImagePreview from "./previews/ImagePreview";
import HTMLPreview from "./previews/HTMLPreview";
import { getFolder } from "../utils/paths";
import { FileSelectListener, TreeFileDTO } from "../types/PackagedFiles";
import { openFileViewer } from "../openViewer";

type FPProps = {
    path: string;
    node: TreeFileDTO;
    inspector: Inspector;
    closer: () => void;
    onFileSelect: FileSelectListener;
    onFileOpen: FileSelectListener;
};

const FilePreview: FunctionComponent<FPProps> = (props) => {
    const node = props.node;
    const canOpen =
        /\.(js|mjs|json|htm|html|xml)$/i.test(node.name) ||
        node.tags.includes("text");

    return (
        <div class="file-preview">
            <div class="properties">
                <table>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <td>{node.name}</td>
                        </tr>
                        {node.name !== props.path ? (
                            <tr>
                                <th>Folder</th>
                                <td>
                                    <span class="path">
                                        {getFolder(props.path)}
                                    </span>
                                </td>
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
                onFileSelect={props.onFileSelect}
            />
            <div class="main-actions">
                {canOpen ? (
                    <a
                        class="open"
                        href={"#/files/" + props.path}
                        onClick={() => props.onFileOpen(props.path, node)}
                        // onClick={() =>
                        //     openFileViewer(props.path, props.inspector)
                        // }
                    >
                        Open
                    </a>
                ) : null}
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
            <a
                class="close"
                title="close preview"
                onClick={() => props.closer()}
            ></a>
        </div>
    );
};

export default FilePreview;

type CPProps = {
    path: string;
    file: TreeNodeDTO;
    inspector: Inspector;
    onFileSelect: FileSelectListener;
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
                    onFileSelect={props.onFileSelect}
                />
            </div>
        );
    }

    return null;
};

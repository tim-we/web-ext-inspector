import { FunctionComponent } from "preact";
import { Inspector } from "../inspector/InspectorFactory";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import prettyBytes from "pretty-bytes";
import { startDownload } from "../utils/download";
import TagList from "./TagList";
import ImagePreview from "./previews/ImagePreview";
import HTMLPreview from "./previews/HTMLPreview";
import { getFolder } from "../utils/paths";
import {
    FileAsyncAction,
    FileSelectListener,
    TreeFileDTO,
} from "../types/PackagedFiles";
import AsyncButton from "./AsyncButton";

type FPProps = {
    path: string;
    node: TreeFileDTO;
    inspector: Inspector;
    closer: () => void;
    onFileSelect: FileSelectListener;
    onFileOpen: FileAsyncAction;
};

const FilePreview: FunctionComponent<FPProps> = (props) => {
    const node = props.node;
    const canOpen =
        /\.(js|mjs|json|htm|html|xml|css)$/i.test(node.name) ||
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
                    <AsyncButton
                        classes={["open"]}
                        onClick={() => props.onFileOpen(props.path, node)}
                    >
                        Open
                    </AsyncButton>
                ) : null}
                <AsyncButton
                    classes={["download"]}
                    description="Download file"
                    onClick={async () => {
                        const url = await props.inspector.getFileDownloadURL(
                            props.path
                        );
                        startDownload(url, node.name);
                    }}
                >
                    Download
                </AsyncButton>
            </div>
            <a
                class="close"
                title="close preview"
                onClick={() => props.closer()}
                data-native
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

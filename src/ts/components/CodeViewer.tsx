import { Component, createRef } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

type Props = {
    remote: Inspector;
    path: string;
    info: TreeNodeDTO & { type: "file" };
    onClose: () => void;
};

type State = {
    file?: {
        url: string;
        content: string;
    };
};

export default class CodeViewer extends Component<Props, State> {
    private codeRef = createRef<HTMLDivElement>();

    public constructor(props: Props) {
        super(props);
        (async () => {
            const url = await props.remote.getFileDownloadURL(props.path, 0.0);
            const response = await fetch(url);
            const content = await response.text();
            await new Promise<void>((resolve) =>
                this.setState({ file: { url, content } }, resolve)
            );
            if (!this.codeRef.current) {
                throw new Error("Code block not available.");
            }
            const html = hljs.highlight(content, {
                language: "javascript",
            }).value;
            this.codeRef.current.innerHTML = html;
        })();
    }

    componentWillUnmount() {
        if (this.state.file) {
            URL.revokeObjectURL(this.state.file.url);
        }
    }

    public render() {
        const props = this.props;
        const file = this.state.file;

        return (
            <div
                class="code-viewer-modal"
                aria-modal={true}
                onClick={(e) => e.stopPropagation()}
            >
                <div class="title-bar">
                    <h2>{file ? props.info.name : "Loading..."}</h2>
                    <div class="modal-controls">
                        <button
                            class="close-file"
                            title="close file"
                            aria-label="close file"
                            onClick={props.onClose}
                        ></button>
                    </div>
                </div>
                <div class="modal-content">
                    <div class="file-content">
                        <pre>
                            <code
                                class="hljs language-javascript"
                                ref={this.codeRef}
                            ></code>
                        </pre>
                    </div>
                </div>
            </div>
        );
    }
}

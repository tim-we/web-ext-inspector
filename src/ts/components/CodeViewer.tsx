import { Component, createRef } from "preact";
import { Inspector } from "../inspector/Inspector";
import { TreeNodeDTO } from "../inspector/worker/FileTree";

type Props = {
    remote: Inspector;
    path: string;
    info: TreeNodeDTO & { type: "file" };
    onClose: () => void;
};

type State = {
    data?: {
        language: string;
    };
};

export default class CodeViewer extends Component<Props, State> {
    private codeRef = createRef<HTMLDivElement>();

    public constructor(props: Props) {
        super(props);
        const remote = props.remote;

        (async () => {
            const result = await remote.highlightCode(props.path);
            await new Promise<void>((resolve) =>
                this.setState({ data: { language: result.language } }, resolve)
            );
            if (!this.codeRef.current) {
                throw new Error("Code block not available.");
            }
            this.codeRef.current.innerHTML = result.code;
        })();
    }

    public render() {
        const props = this.props;
        const loaded = this.state.data !== undefined;
        const codeClasses = ["hljs"];

        if (this.state.data) {
            codeClasses.push("language-" + this.state.data.language);
        }

        return (
            <div
                class="code-viewer-modal"
                aria-modal={true}
                onClick={(e) => e.stopPropagation()}
            >
                <div class="title-bar">
                    <h2>{loaded ? props.info.name : "Loading..."}</h2>
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

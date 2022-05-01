import { Component } from "preact";
import FileExplorer from "./FileExplorer";
import ExtensionMetaData from "./ExtensionMetaData";
import { createInspector, Inspector } from "../inspector/InspectorFactory";
import ExtensionPermissions from "./Permissions";
import { openFileViewer } from "../openViewer";
import UIBox from "./UIBox";
import { getDownloadURL as getCWSDownloadURL } from "../inspector/worker/CWS";
import { ExtensionId } from "../types/ExtensionId";

type Props = {
    extension: ExtensionId;
};

type State = {
    inspector?: Inspector;
    statusMessage?: string;
    loading: boolean;
};

export default class ExtensionInspector extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            statusMessage: "loading",
        };

        createInspector(props.extension, (status) => {
            this.setState({ statusMessage: status });
        }).then(async (inspector) => {
            this.setState({ inspector, loading: false });

            const details = await inspector.getDetails();
            document.title = `Inspecting ${details.name}`;

            // if (props.extension.type === "url") {
            //     URL.revokeObjectURL(props.extension.url);
            // }
        });
    }

    public render() {
        const state = this.state;
        const ext = this.props.extension;

        return (
            <>
                {state.inspector ? (
                    <>
                        <ExtensionMetaData inspector={state.inspector} />
                        <ExtensionPermissions inspector={state.inspector} />
                        <FileExplorer
                            selected="manifest.json"
                            inspector={state.inspector}
                            onFileOpen={async (path, info) =>
                                openFileViewer(path, state.inspector!)
                            }
                        />
                    </>
                ) : null}
                {state.statusMessage ? (
                    <div class="status-message" role="status">
                        {state.statusMessage}
                    </div>
                ) : null}
                {state.loading && ext.source === "chrome" ? (
                    <UIBox title="Information">
                        Chrome extensions require a download proxy and could
                        therefore take longer to load. If there is a problem
                        with the download you can
                        <ol>
                            <li>
                                <a
                                    href={getCWSDownloadURL(ext.id)}
                                    download={true}
                                    data-native
                                >
                                    download the extension manually
                                </a>
                            </li>
                            <li>upload it on the start page</li>
                        </ol>
                    </UIBox>
                ) : null}
            </>
        );
    }
}

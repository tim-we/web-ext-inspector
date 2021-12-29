import { Component } from "preact";
import FileExplorer from "./FileExplorer";
import ExtensionMetaData from "./ExtensionMetaData";
import { createInspector, Inspector } from "../inspector/Inspector";
import ExtensionPermissions from "./Permissions";
import { ExtensionSourceInfo } from "../inspector/worker/worker";
import { openFileViewer } from "../openViewer";

type Props = {
    extension: ExtensionSourceInfo;
};

type State = {
    inspector?: Inspector;
    status?: string;
};

export default class ExtensionInspector extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            status: "loading",
        };

        createInspector(props.extension, (status) => {
            this.setState({ status });
        }).then((inspector) => {
            this.setState({ inspector });

            if (props.extension.type === "url") {
                URL.revokeObjectURL(props.extension.url);
            }
        });
    }

    public render() {
        const state = this.state;
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
                {state.status ? (
                    <div class="status" role="status">
                        {state.status}
                    </div>
                ) : null}
            </>
        );
    }
}

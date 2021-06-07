import { Component } from "preact";
import FileExplorer from "./FileExplorer";
import ExtensionMetaData from "./ExtensionMetaData";
import { createInspector, Inspector } from "../inspector/Inspector";
import ExtensionPermissions from "./Permissions";
import { TreeNodeDTO } from "../inspector/worker/FileTree";
import CodeViewer from "./CodeViewer";

type Props = {
    extId: string;
};

type State = {
    inspector?: Inspector;
    status?: string;
    currentFile?: {
        path: string;
        info: TreeNodeDTO & { type: "file" };
    };
};

export default class ExtensionInspector extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            status: "loading",
        };

        createInspector(props.extId, (status) => {
            this.setState({ status });
        }).then((inspector) => {
            this.setState({ inspector });
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
                            path=""
                            inspector={state.inspector}
                            onFileOpen={(path, info) =>
                                this.setState({ currentFile: { path, info } })
                            }
                        />
                    </>
                ) : null}
                {state.status ? (
                    <div class="status" role="status">
                        {state.status}
                    </div>
                ) : null}
                {state.currentFile ? (
                    <CodeViewer
                        remote={state.inspector!}
                        path={state.currentFile.path}
                        info={state.currentFile.info}
                        onClose={() =>
                            this.setState({ currentFile: undefined })
                        }
                    />
                ) : null}
            </>
        );
    }
}

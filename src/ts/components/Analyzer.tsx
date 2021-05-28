import { Component } from "preact";
import FileExplorer from "./FileExplorer";
import ExtensionDetails from "./ExtensionDetails";
import {
    createInspector,
    Inspector,
    InspectorReadyState,
} from "../inspector/Inspector";
import * as Comlink from "comlink";

type Props = {
    extId: string;
};

type State = {
    inspector: Inspector;
    readyState: InspectorReadyState;
};

export default class Analyzer extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        const inspector = createInspector(props.extId);
        this.state = {
            inspector,
            readyState: "downloading",
        };
        inspector.onReadyStateChange(
            Comlink.proxy((readyState) => {
                this.setState({ readyState });
            })
        );
    }

    public render() {
        const state = this.state;
        return (
            <div>
                <h2>Extension Inspector</h2>
                {state.readyState !== "loading-details" ? (
                    <ExtensionDetails inspector={state.inspector} />
                ) : null}
                {state.readyState === "ready" ? (
                    <FileExplorer path="" inspector={state.inspector} />
                ) : (
                    <div class="readyState">{state.readyState}</div>
                )}
            </div>
        );
    }
}

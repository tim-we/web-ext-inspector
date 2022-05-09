import { Component } from "preact";
import prettyBytes from "pretty-bytes";
import { Inspector } from "../inspector/InspectorFactory";
import friendlyTime from "friendly-time";
import UIBox from "./UIBox";
import { ExtensionDetails } from "../types/ExtensionDetails";

type Props = {
    inspector: Inspector;
};

type State = {
    details?: ExtensionDetails;
};

export default class ExtensionMetaData extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        props.inspector
            .getDetails()
            .then((details) => this.setState({ details }));
    }

    public render() {
        const details = this.state.details;

        if (details === undefined) {
            return <div>loading details...</div>;
        }

        const lastUpdateTime = details.last_updated
            ? new Date(details.last_updated)
            : undefined;
        const createdTime = details.created
            ? new Date(details.created)
            : undefined;

        return (
            <UIBox title="Details" classes={["extension-meta-data"]}>
                {details.icon_url ? (
                    <img
                        class="icon"
                        src={details.icon_url}
                        alt="extension icon"
                    />
                ) : null}
                <table>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{details.name}</td>
                        </tr>
                        {details.author ? (
                            <tr>
                                <td>Author</td>
                                <td>{details.author}</td>
                            </tr>
                        ) : null}
                        <tr>
                            <td>Version</td>
                            <td>
                                <span>{details.version}</span>
                                {lastUpdateTime ? (
                                    <span
                                        class="version friendly-time"
                                        title="last updated"
                                    >
                                        {`(${friendlyTime(lastUpdateTime)})`}
                                    </span>
                                ) : null}
                            </td>
                        </tr>
                        {createdTime ? (
                            <tr>
                                <td>Created</td>
                                <td>{friendlyTime(createdTime)}</td>
                            </tr>
                        ) : null}
                        <tr>
                            <td>Size</td>
                            <td>{prettyBytes(details.size)}</td>
                        </tr>
                    </tbody>
                </table>
            </UIBox>
        );
    }
}

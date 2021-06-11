import { Component } from "preact";
import { Details } from "../inspector/worker/AMOAPI";
import prettyBytes from "pretty-bytes";
import { Inspector } from "../inspector/Inspector";
import friendlyTime from "friendly-time";
import UIBox from "./UIBox";

type Props = {
    inspector: Inspector;
};

type State = {
    details?: Details;
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

        const ext = details.current_version.files.filter(
            (f) => f.is_webextension
        )[0];

        const lastUpdateTime = new Date(details.last_updated);
        const createdTime = new Date(details.created);

        return (
            <UIBox title="Details" classes={["extension-meta-data"]}>
                <img class="icon" src={details.icon_url} alt="extension icon" />
                <table>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{details.name["en-US"]}</td>
                        </tr>
                        <tr>
                            <td>
                                {details.authors.length > 1
                                    ? "Authors"
                                    : "Author"}
                            </td>
                            <td>
                                {details.authors
                                    .map((a) => a.name || a.username)
                                    .join(", ")}
                            </td>
                        </tr>
                        <tr>
                            <td>Last Update</td>
                            <td>
                                <span>{friendlyTime(lastUpdateTime)}</span>
                                <span class="version-info">{`(Version ${details.current_version.version})`}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Created</td>
                            <td>{friendlyTime(createdTime)}</td>
                        </tr>
                        <tr>
                            <td>Size</td>
                            <td>{prettyBytes(ext.size)}</td>
                        </tr>
                    </tbody>
                </table>
            </UIBox>
        );
    }
}

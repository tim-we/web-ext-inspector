import { Component } from "preact";
import { Details } from "../inspector/worker/AMOAPI";
import prettyBytes from "pretty-bytes";
import { Inspector } from "../inspector/Inspector";
import friendlyTime from "friendly-time";

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

        return (
            <div class="extension-meta-data">
                <table>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{details.name["en-US"]}</td>
                        </tr>
                        <tr>
                            <td>Icon</td>
                            <td>
                                <img
                                    class="icon"
                                    src={details.icon_url}
                                    alt="extension icon"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Version</td>
                            <td>
                                <span>{details.current_version.version}</span>
                                <span
                                    class="last-updated"
                                    title="last updated"
                                >{`(${friendlyTime(lastUpdateTime)})`}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Size</td>
                            <td>{prettyBytes(ext.size)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

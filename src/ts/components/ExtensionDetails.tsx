import { Component } from "preact";
import { Details } from "../inspector/worker/AMOAPI";
import prettyBytes from "pretty-bytes";
import { Inspector } from "../inspector/Inspector";

type Props = {
    inspector: Inspector;
};

type State = {
    details?: Details;
};

export default class ExtensionDetails extends Component<Props, State> {
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

        return (
            <div>
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
                                    src={details.icon_url}
                                    alt="extension icon"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Slug</td>
                            <td>{details.slug}</td>
                        </tr>
                        <tr>
                            <td>Version</td>
                            <td>{details.current_version.version}</td>
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

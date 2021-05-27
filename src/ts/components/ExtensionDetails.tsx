import { Component } from "preact";
import { Details } from "../AMOAPI";
import prettyBytes from "pretty-bytes";

type Props = {
    details: Details;
};

export default class ExtensionDetails extends Component<Props> {
    public render() {
        const details = this.props.details;

        const ext = details.current_version.files.filter(f => f.is_webextension)[0];

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

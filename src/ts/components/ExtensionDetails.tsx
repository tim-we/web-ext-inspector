import { Component } from "preact";
import { Details } from "../AMOAPI";

type Props = {
    details: Details;
};

export default class ExtensionDetails extends Component<Props> {
    public render() {
        const details = this.props.details;

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
                    </tbody>
                </table>
            </div>
        );
    }
}

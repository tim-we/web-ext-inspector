import { Component } from "preact";
import { Inspector } from "../../inspector/Inspector";

type Props = {
    path: string;
    name: string;
    inspector: Inspector;
};

type State = {
    dataURL?: string;
};

export default class ImagePreview extends Component<Props, State> {
    componentWillMount() {
        this.props.inspector
            .getFileDownloadURL(this.props.path, 0.0)
            .then((dataURL) => this.setState({ dataURL }));
    }

    componentWillUnmount() {
        if (this.state.dataURL) {
            URL.revokeObjectURL(this.state.dataURL);
        }
    }

    public render() {
        if (this.state.dataURL) {
            return (
                <div class="image-preview">
                    <img
                        src={this.state.dataURL}
                        alt={this.props.name}
                        decoding="async"
                    />
                </div>
            );
        } else {
            return null;
        }
    }
}

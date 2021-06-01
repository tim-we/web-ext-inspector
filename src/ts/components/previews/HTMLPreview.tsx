import { Component } from "preact";
import { Inspector } from "../../inspector/Inspector";

type Props = {
    path: string;
    name: string;
    inspector: Inspector;
};

type State = {
    references?: string[];
};

export default class HTMLPreview extends Component<Props, State> {
    componentWillMount() {
        this.props.inspector
            .analyzeHTML(this.props.path)
            .then(({ scripts }) => {
                this.setState({ references: scripts });
            });
    }

    public render() {
        if (this.state.references !== undefined) {
            return (
                <div class="referenced-scripts">
                    <b>Scripts</b>
                    <ul>
                        {this.state.references.map((path) => (
                            <li key={path}>{path}</li>
                        ))}
                    </ul>
                </div>
            );
        } else {
            return null;
        }
    }
}

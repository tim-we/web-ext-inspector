import * as Preact from "preact";
import Analyzer from "./components/Analyzer";
import Home from "./components/ExtensionSelector";

type AppState = {
    extension?: string;
};

class App extends Preact.Component<{}, AppState> {
    public render() {
        const extension = this.state.extension;

        if (extension) {
            return <Analyzer extension={extension} />;
        } else {
            return (
                <Home
                    onSelect={(ext) =>
                        this.setState({ extension: ext })
                    }
                />
            );
        }
    }
}

Preact.render(<App />, document.body);

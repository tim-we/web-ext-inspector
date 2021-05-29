import * as Preact from "preact";
import Analyzer from "./components/Analyzer";
import ExtensionSelector from "./components/ExtensionSelector";

// create styles (in <head>)
import "../less/app.less";

type AppState = {
    extension?: string;
};

class App extends Preact.Component<{}, AppState> {
    public constructor() {
        super();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("extension")) {
            if (/^[a-z0-9\-]+$/.test(urlParams.get("extension")!)) {
                this.state = { extension: urlParams.get("extension")! };
            }
        }
    }

    public render() {
        const extension = this.state.extension;

        if (extension) {
            return <Analyzer extId={extension} />;
        } else {
            return (
                <ExtensionSelector
                    onSelect={(ext) => this.setState({ extension: ext })}
                />
            );
        }
    }
}

Preact.render(<App />, document.body);

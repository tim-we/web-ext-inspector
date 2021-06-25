import * as Preact from "preact";
import ExtensionInspector from "./components/ExtensionInspector";
import ExtensionSelector from "./components/ExtensionSelector";
import { ExtensionSourceInfo } from "./inspector/worker/worker";

// create styles (in <head>)
import "highlight.js/styles/a11y-dark.css";
import "../less/app.less";
import ConfigUI from "./components/ConfigUI";


type AppState = {
    extension?: ExtensionSourceInfo;
};

class App extends Preact.Component<{}, AppState> {
    public constructor() {
        super();
        const urlParams = new URLSearchParams(window.location.search);
        const extParamValue = urlParams.get("extension");
        if (extParamValue) {
            if (/^[a-z0-9\-]+$/.test(extParamValue)) {
                this.state = { extension: { type: "amo", id: extParamValue } };
            }
        }
    }

    public render() {
        const extension = this.state.extension;

        return (
            <>
                <header>
                    <h1>Extension Inspector</h1>
                </header>
                {extension ? (
                    <ExtensionInspector extension={extension} />
                ) : (
                    <ExtensionSelector
                        onSelect={(ext) => this.setState({ extension: ext })}
                    />
                )}
                <div class="hfill"></div>
                <footer>
                    <a
                        id="view-on-github"
                        href="https://github.com/tim-we/web-ext-inspector"
                    >
                        View on GitHub
                    </a>
                </footer>
                <ConfigUI />
            </>
        );
    }
}

Preact.render(<App />, document.body);

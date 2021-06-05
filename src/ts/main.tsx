import * as Preact from "preact";
import ExtensionInspector from "./components/ExtensionInspector";
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

        return (
            <>
                <header>
                    <h2>Extension Inspector</h2>
                </header>
                {extension ? (
                    <ExtensionInspector extId={extension} />
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
            </>
        );
    }
}

Preact.render(<App />, document.body);

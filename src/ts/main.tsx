import * as Preact from "preact";
import ExtensionInspector from "./components/ExtensionInspector";
import ExtensionSelector from "./components/ExtensionSelector";
import { ExtensionSourceInfo } from "./inspector/worker/worker";

// create styles (in <head>)
import "prismjs/themes/prism-okaidia.css";
import "../less/app.less";
import ConfigUI from "./components/ConfigUI";
import { setPortal } from "./modal";

type AppState = {
    extension?: ExtensionSourceInfo;
};

class App extends Preact.Component<{}, AppState> {
    public constructor() {
        super();

        const urlParams = new URLSearchParams(window.location.search);
        const extIdParamValue = urlParams.get("extension");
        const extStoreParamValue = urlParams.get("store") ?? "amo";

        if (!["amo", "cws"].includes(extStoreParamValue)) {
            console.error("Unknown extension store: ", extStoreParamValue);
            return;
        }

        if (extIdParamValue) {
            if (/^[a-z0-9\-]+$/.test(extIdParamValue)) {
                this.state = {
                    extension: {
                        type: extStoreParamValue as "amo" | "cws",
                        id: extIdParamValue,
                    },
                };
            }
        }
    }

    public render() {
        const extension = this.state.extension;
        const title = <h1>Extension Inspector</h1>;

        return (
            <>
                <header>
                    {extension ? (
                        <a
                            onClick={() =>
                                this.setState({ extension: undefined })
                            }
                        >
                            {title}
                        </a>
                    ) : (
                        title
                    )}
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

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

const modalPortal = document.createElement("div");
modalPortal.id = "modalPortal";
document.body.appendChild(modalPortal);
setPortal(modalPortal);

Preact.render(<App />, root);

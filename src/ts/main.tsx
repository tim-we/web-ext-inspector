import * as Preact from "preact";
import { Route, Router, route } from "preact-router";

import ExtensionInspector from "./components/ExtensionInspector";
import ExtensionSelector from "./components/ExtensionSelector";
import ConfigUI from "./components/ConfigUI";
import { setPortal } from "./modal";
import * as LFP from "./utils/LocalFileProvider";

// create styles (in <head>)
import "prismjs/themes/prism-okaidia.css";
import "../less/app.less";

type ExtInspectorFC = Preact.FunctionalComponent<{ id: string }>;

const FirefoxExtensionInspector: ExtInspectorFC = ({ id }) => (
    <ExtensionInspector extension={{ type: "amo", id }} />
);
const ChromeExtensionInspector: ExtInspectorFC = ({ id }) => (
    <ExtensionInspector extension={{ type: "cws", id }} />
);
const LocalExtensionInspector: ExtInspectorFC = ({ id }) => {
    const url = LFP.getURL(id);
    if (!url) {
        route("/", true);
        return null;
    }
    return <ExtensionInspector extension={{ type: "url", url }} />;
};

class App extends Preact.Component<{}> {
    public render() {
        return (
            <>
                <header>
                    <a href="/">
                        <h1>Extension Inspector</h1>
                    </a>
                </header>
                <Router>
                    <Route
                        path="/inspect/firefox/:id"
                        component={FirefoxExtensionInspector}
                    />
                    <Route
                        path="/inspect/chrome/:id"
                        component={ChromeExtensionInspector}
                    />
                    <Route
                        path="/inspect/file/:id"
                        component={LocalExtensionInspector}
                    />
                    <Route path="/" component={ExtensionSelector} default />
                </Router>
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

(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("route")) {
        console.log("routing to " + urlParams.get("route"));
        route(urlParams.get("route")!, true);
    } else if (urlParams.has("extension")) {
        if (!/^[a-z0-9\-]+$/.test(urlParams.get("extension")!)) {
            return;
        }
        const sources = new Map([
            ["amo", "firefox"],
            ["cws", "chrome"],
        ]);
        const store = urlParams.get("store");
        const source =
            store && sources.has(store) ? sources.get(store) : "firefox";
        const r = "/inspect/" + source + "/" + urlParams.get("extension")!;
        console.log("routing to " + route);
        route(r, true);
    }
})();

import * as Preact from "preact";
import { Router, Link, Switch, Route, useLocation } from "wouter-preact";

import ExtensionInspector from "./components/ExtensionInspector";
import ExtensionSelector from "./components/ExtensionSelector";
import ConfigUI from "./components/ConfigUI";
import { setPortal } from "./modal";
import * as LFP from "./utils/LocalFileProvider";

// create styles (in <head>)
import "prismjs/themes/prism-okaidia.css";
import "../less/app.less";

class App extends Preact.Component<{}> {
    public render() {
        return (
            <Router>
                <header>
                    <Link href="/">
                        <h1>Extension Inspector</h1>
                    </Link>
                </header>
                <Switch>
                    <Route path="/inspect/firefox/:id">
                        {({ id }) => (
                            <ExtensionInspector
                                extension={{ type: "amo", id }}
                            />
                        )}
                    </Route>
                    <Route path="/inspect/chrome/:id">
                        {({ id }) => (
                            <ExtensionInspector
                                extension={{ type: "cws", id }}
                            />
                        )}
                    </Route>
                    <Route path="/inspect/file/:id">
                        {({ id }) => {
                            const url = LFP.getURL(id);
                            const [, navigate] = useLocation();
                            if (!url) {
                                navigate("/", { replace: true });
                                return null;
                            }
                            return (
                                <ExtensionInspector
                                    extension={{ type: "url", url }}
                                />
                            );
                        }}
                    </Route>
                    <Route>
                        <ExtensionSelector />
                    </Route>
                </Switch>
                <div class="hfill"></div>
                <footer>
                    <a
                        id="view-on-github"
                        href="https://github.com/tim-we/web-ext-inspector"
                        data-native
                    >
                        View on GitHub
                    </a>
                </footer>
                <ConfigUI />
            </Router>
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
    const [, navigate] = useLocation();

    if (urlParams.has("route")) {
        console.log("routing to " + urlParams.get("route"));
        navigate(urlParams.get("route")!, { replace: true });
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
        const route = "/inspect/" + source + "/" + urlParams.get("extension")!;
        navigate(route, { replace: true });
    }
})();

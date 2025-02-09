import type { ExtensionData } from "../extension/types/ExtensionData";

import * as Preact from "preact";
import { useEffect, useState } from "preact/hooks";

import wrappedWorker from "./MainWorkerRef";
import ExtensionView from "./ui/extension/ExtensionView";
import ExtensionSelector from "./ui/selector/ExtensionSelector";

import "./ui/main.css";
import { popupRoot } from "./ui/popups/PopupWindow";

declare const __VERSION__: string;

const root = document.querySelector("main")!;

document.querySelector<HTMLSpanElement>("#app-version")!.innerText = `v${__VERSION__}`;

document.body.append(popupRoot);

const App: Preact.FunctionComponent = () => {
  // TODO: consider Preact Signals
  const [extensions, setExtensions] = useState<ExtensionData[]>([]);
  const [selector, setSelector] = useState<boolean>(true);

  const showSelector = extensions.length === 0 || selector;

  useEffect(() => {
    wrappedWorker.loadExtension("/test/extension.xpi").then((data) => setExtensions([data]));
  }, []);

  return (
    <>
      {showSelector && <ExtensionSelector closable={extensions.length > 0} />}
      {extensions.map((data) => (
        <ExtensionView key={data.id} data={data} />
      ))}
    </>
  );
};

Preact.render(<App />, root);

// Remove temporary style sheet because when this (deferred) script runs
// the proper CSS has been loaded already.
document.querySelector<HTMLLinkElement>("#temporary-style")!.remove();

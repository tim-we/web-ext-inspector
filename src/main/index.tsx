import type { ExtensionData } from "../extension/types/ExtensionData";

import * as Preact from "preact";
import { useState } from "preact/hooks";

import wrappedWorker from "./MainWorkerRef";
import ExtensionView from "./ui/extension/ExtensionView";
import ExtensionSelector from "./ui/selector/ExtensionSelector";

import "./ui/main.scss";
import { modalRoot } from "./ui/modals/ModalWindow";

declare const __VERSION__: string;

const root = document.querySelector("main")!;

document.querySelector<HTMLSpanElement>("#app-version")!.innerText = `v${__VERSION__}`;

document.body.append(modalRoot);

const App: Preact.FunctionComponent = () => {
  // TODO: consider Preact Signals
  const [extensions, setExtensions] = useState<ExtensionData[]>([]);
  const [selector, setSelector] = useState<boolean>(true);

  const showSelector = extensions.length === 0 || selector;

  return (
    <>
      {showSelector && <ExtensionSelector closable={extensions.length > 0} />}
      {extensions.map((data) => (
        <ExtensionView data={data} />
      ))}
    </>
  );
};

Preact.render(<App />, root);

(async () => {
  const data = await wrappedWorker.loadExtension("/test/extension.xpi");

  Preact.render(
    <>
      <ExtensionSelector closable={true} />
      <ExtensionView data={data} />
    </>,
    root
  );

  if (data.dynamicAnalysis.supported) {
    console.log("running extension...");
    await wrappedWorker.run(data.id);
  }
})();

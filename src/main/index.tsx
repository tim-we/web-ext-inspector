import * as Preact from "preact";
import { useEffect, useState } from "preact/hooks";

import wrappedWorker from "./MainWorkerRef";
import ExtensionView from "./ui/extension/ExtensionView";
import ExtensionSelector from "./ui/selector/ExtensionSelector";

import "./ui/main.css";
import SessionProxy from "./SessionProxy";
import { useSessionStore } from "./ui/SessionStore";
import { popupRoot } from "./ui/popups/PopupWindow";

const root = document.querySelector("main")!;

document.querySelector<HTMLSpanElement>("#app-version")!.innerText = `v${__VERSION__}`;

document.body.append(popupRoot);

const App: Preact.FunctionComponent = () => {
  const { sessions, addSession } = useSessionStore();
  const [selector, setSelector] = useState<boolean>(true);

  const showSelector = sessions.length === 0 || selector;

  useEffect(() => {
    const url = "/test/extension.xpi";
    wrappedWorker.startSession(url).then(async (session) => {
      const proxy = await SessionProxy.create({ type: "url", url }, session);
      addSession(proxy);
    });
  }, [addSession]);

  return (
    <>
      {showSelector && <ExtensionSelector closable={sessions.length > 0} />}
      {sessions.map((session) => (
        <ExtensionView key={session.id} session={session} />
      ))}
    </>
  );
};

Preact.render(<App />, root);

// Remove temporary style sheet because when this (deferred) script runs
// the proper CSS has been loaded already.
document.querySelector<HTMLLinkElement>("#temporary-style")!.remove();

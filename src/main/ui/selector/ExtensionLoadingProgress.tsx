import * as Comlink from "comlink";
import type { FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { LoadingStatus } from "../../background";
import wrappedWorker from "../../MainWorkerRef";
import { useSessionStore } from "../SessionStore";

type Props = {
  source: ExtensionSource;
  onClose?: () => unknown;
};

const ExtensionLoadingProgress: FunctionComponent<Props> = ({ source, onClose }) => {
  const { addSession: addExtension } = useSessionStore();
  const [state, setState] = useState<LoadingStatus | "error">("worker-init");
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (source.type !== "url") {
      // TODO
      return;
    }
    wrappedWorker
      .startSession(
        source.url,
        Comlink.proxy((newState: LoadingStatus) => setState(newState))
      )
      .then(
        (data) => {
          addExtension(data);
          onClose?.();
        },
        (error: string) => setErrorMessage(error)
      );
  }, [JSON.stringify(source), addExtension]);

  if (state === "error") {
    return (
      <div class="loading-status error">
        <span>Error</span>
        <span>{errorMessage}</span>
      </div>
    );
  }

  return (
    <div class="loading-status">
      <span>{stateLabels[state]}</span>
      <progress />
    </div>
  );
};

export default ExtensionLoadingProgress;

const stateLabels: Record<LoadingStatus, string> = {
  "worker-init": "Initializing worker...",
  requesting: "Requesting extension download...",
  downloading: "Downloading the extension...",
  unpacking: "Unpacking & initializing extension..."
};

type ExtensionSource =
  | {
      type: "amo" | "cws";
      id: string;
    }
  | { type: "file"; file: File }
  | { type: "url"; url: string };

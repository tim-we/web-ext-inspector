import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import type { HighlightedCode } from "../../background";

import { useEffect, useState } from "preact/hooks";
import "prismjs/themes/prism-okaidia.css";
import "./code-viewer.scss";

import wrappedWorker from "../../MainWorkerRef";
import { showModalWindow } from "../modals/ModalWindow";

export function openCodeViewer(extensionId: ExtensionId, path: string): void {
  showModalWindow(extensionId, {
    title: path.replace(/^\//, ""),
    icon: "code-viewer",
    content: <CodeViewer extId={extensionId} path={path} />,
    initialWidth: 800,
    initialHeight: 1000
  });
}

const CodeViewer: FunctionComponent<Props> = ({ extId, path }) => {
  const [content, setContent] = useState<HighlightedCode | undefined>(undefined);

  useEffect(() => {
    wrappedWorker.getPrettyCode(extId, path).then(setContent, (e) => console.error(e));
  }, []);

  if (content === undefined) {
    return <span>Loading...</span>;
  }

  const html = { __html: content.code };

  // biome-ignore lint/security/noDangerouslySetInnerHtml: see below
  const unsafeCode = <code class={`language-${content.language}`} dangerouslySetInnerHTML={html} />;
  // At the moment the worker will create HTML that should be displayed here. This might change in the future.

  return <pre>{unsafeCode}</pre>;
};

type ExtensionId = ExtensionData["id"];

type Props = {
  extId: ExtensionId;
  path: string;
};

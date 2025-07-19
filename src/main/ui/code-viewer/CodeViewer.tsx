import type { FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { HighlightedCode } from "../../Session";
import "prismjs/themes/prism-okaidia.css";
import "./code-viewer.css";

import type SessionProxy from "../../SessionProxy";
import { showPopupWindow } from "../popups/PopupWindow";

export function openCodeViewer(session: SessionProxy, path: string): void {
  showPopupWindow(session.id, {
    title: path.replace(/^\//, ""),
    icon: "code-viewer",
    content: <CodeViewer session={session} path={path} />,
    initialWidth: 800,
    initialHeight: 1000
  });
}

const CodeViewer: FunctionComponent<Props> = ({ session, path }) => {
  const [content, setContent] = useState<HighlightedCode | undefined>(undefined);

  useEffect(() => {
    session.getPrettyCode(path).then(setContent, (e) => console.error(e));
  }, [session, path]);

  if (content === undefined) {
    return <span>Loading...</span>;
  }

  const html = { __html: content.code };

  // biome-ignore lint/security/noDangerouslySetInnerHtml: see below
  const unsafeCode = <code class={`language-${content.language}`} dangerouslySetInnerHTML={html} />;
  // At the moment the worker will create HTML that should be displayed here. This might change in the future.

  return <pre>{unsafeCode}</pre>;
};

type Props = {
  session: SessionProxy;
  path: string;
};

import type { FunctionComponent } from "preact";
import { useContext, useState } from "preact/hooks";

import type SessionProxy from "../../SessionProxy";
import SessionContext from "../contexts/SessionContext";
import { type PopupWindowOptions, showPopupWindow } from "../popups/PopupWindow";

import ExtensionColorContext from "../contexts/ExtensionColorContext";
import "./tiles.css";

type Props = {
  title: string;
  popup?: (session: SessionProxy) => Promise<PopupWindowOptions> | PopupWindowOptions;
  cssClass?: string;
};

const Tile: FunctionComponent<Props> = ({ title, cssClass, popup: popupOptions, children }) => {
  const session = useContext(SessionContext)!;
  DEV: console.assert(session !== undefined);
  const color = useContext(ExtensionColorContext);
  const [hasWindow, setHasWindow] = useState(false);

  const clickHandler = popupOptions
    ? async (e: Event) => {
        e.stopPropagation();
        if (hasWindow) {
          return;
        }

        const options = {
          color,
          ...(await popupOptions(session))
        };

        showPopupWindow(session.id, options).then(() => setHasWindow(false));
        setHasWindow(true);
      }
    : undefined;

  return (
    <button
      class={`tile ${cssClass ?? ""}`}
      onClick={clickHandler}
      type="button"
      disabled={!popupOptions}
    >
      <h3>{title}</h3>
      <div class="content">{children}</div>
    </button>
  );
};

export default Tile;

import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import ExtensionIdContext from "../contexts/ExtensionIdContext";
import { type PopupWindowOptions, showPopupWindow } from "../popups/PopupWindow";

import { useContext, useState } from "preact/hooks";
import ExtensionColorContext from "../contexts/ExtensionColorContext";
import "./tiles.css";

type Props = {
  title: string;
  popup: (extId: ExtensionData["id"]) => PopupWindowOptions;
  cssClass?: string;
};

const Tile: FunctionComponent<Props> = ({ title, cssClass, popup: popupOptions, children }) => {
  const extensionId = useContext(ExtensionIdContext)!;
  const color = useContext(ExtensionColorContext);
  const [hasWindow, setHasWindow] = useState(false);

  const clickHandler = (e: Event) => {
    e.stopPropagation();
    if (hasWindow) {
      return;
    }

    const options = {
      color,
      ...popupOptions(extensionId)
    };

    showPopupWindow(extensionId, options).then(() => setHasWindow(false));
    setHasWindow(true);
  };

  return (
    <button class={`tile ${cssClass ?? ""}`} onClick={clickHandler} type="button">
      <h3>{title}</h3>
      <div class="content">{children}</div>
    </button>
  );
};

export default Tile;

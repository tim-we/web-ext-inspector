import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import ExtensionIdContext from "../contexts/ExtensionIdContext";
import { ModalWindowOptions, showModalWindow } from "../modals/ModalWindow";

import { useContext, useState } from "preact/hooks";
import ExtensionColorContext from "../contexts/ExtensionColorContext";
import "./tiles.scss";

type Props = {
  title: string;
  modal: (extId: ExtensionData["id"]) => ModalWindowOptions;
  cssClass?: string;
};

const Tile: FunctionComponent<Props> = ({ title, cssClass, modal: modalOptions, children }) => {
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
      ...modalOptions(extensionId)
    };

    showModalWindow(extensionId, options).then(() => setHasWindow(false));
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

import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import Tile from "./Tile";

import "./meta-tile.css";

const sources = {
  amo: "addons.mozilla.org",
  cws: "Chrome Web Store",
  file: "Local file"
};
const MetaTile: FunctionComponent<ExtensionData["meta"]> = ({
  icon,
  author,
  source,
  manifestVersion,
  size
}) => {
  return (
    <Tile title="Meta" cssClass="meta" popup={createPopupOptions}>
      {icon && <img src={icon} alt="extension icon" />}
      <div class="hfill" />
      <ul>
        <li>
          <span>Manifest Version</span>
          <span>{manifestVersion}</span>
        </li>
        <li>
          <span>{author ? "Author" : "Source"}</span>
          <span>{author ?? sources[source]}</span>
        </li>
        <li title="Uncompressed size">
          <span>Size</span>
          <span>{size}</span>
        </li>
      </ul>
    </Tile>
  );
};

export default MetaTile;

function createPopupOptions() {
  return {
    title: "Meta Information",
    content: "Not yet implemented."
  };
}

// TODO:
// - list of features (actions, options page, content scripts, ...)

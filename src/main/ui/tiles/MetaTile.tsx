import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import Tile from "./Tile";

const sources = {
  amo: "addons.mozilla.org",
  cws: "Chrome Web Store",
  file: "Local file"
};
const MetaTile: FunctionComponent<ExtensionData["meta"]> = ({
  icon,
  version,
  author,
  source,
  manifestVersion
}) => {
  return (
    <Tile title="Meta" cssClass="meta" popup={createPopupOptions}>
      {icon && <img src={icon} alt="extension icon" />}
      <div class="hfill" />
      <ul>
        <li>
          <span>Version</span>
          <span>{version}</span>
        </li>
        <li>
          <span>Manifest Version</span>
          <span>{manifestVersion}</span>
        </li>
        <li>
          <span>{author ? "Author" : "Source"}</span>
          <span>{author ?? sources[source]}</span>
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
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
  locales
}) => {
  return (
    <Tile title="Meta" cssClass="meta" modal={createModalOptions}>
      {icon && <img src={icon} alt="extension icon" />}
      <div class="hfill" />
      <ul>
        <li>
          <span>Version</span>
          <span>{version}</span>
        </li>
        <li>
          <span>{author ? "Author" : "Source"}</span>
          <span>{author ?? sources[source]}</span>
        </li>
        <li>
          <span>Locales</span>
          <span>{locales}</span>
        </li>
      </ul>
    </Tile>
  );
};

export default MetaTile;

function createModalOptions() {
  return {
    title: "Meta Information",
    content: "Not yet implemented."
  };
}

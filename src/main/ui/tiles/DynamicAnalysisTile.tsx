import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import Tile from "./Tile";

type Props = ExtensionData["dynamicAnalysis"];

const DynamicAnalysisTile: FunctionComponent<Props> = ({ supported, background, jsType }) => {
  return (
    <Tile title="Dynamic Analysis" cssClass="da" modal={createModalOptions}>
      <ul>
        <li>{supported ? "supported" : "not supported"}</li>
        <li>{background ? "has background scripts" : "no background scripts"}</li>
        <li>JS type: {jsType ?? "unknown"}</li>
      </ul>
    </Tile>
  );
};

export default DynamicAnalysisTile;

function createModalOptions() {
  return {
    title: "Dynamic Analysis",
    content: "Not yet implemented."
  };
}

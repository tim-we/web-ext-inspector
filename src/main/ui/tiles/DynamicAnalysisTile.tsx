import type { FunctionComponent } from "preact";
import type { ExtensionSummary } from "../../../extension/types/ExtensionSummary";

import Tile from "./Tile";

type Props = ExtensionSummary["dynamicAnalysis"];

const DynamicAnalysisTile: FunctionComponent<Props> = ({ supported, background, jsType }) => {
  return (
    <Tile title="Dynamic Analysis" cssClass="da">
      <ul>
        <li>{supported ? "supported" : "not supported"}</li>
        <li>{background ? "has background scripts" : "no background scripts"}</li>
        <li>JS type: {jsType ?? "unknown"}</li>
      </ul>
    </Tile>
  );
};

export default DynamicAnalysisTile;

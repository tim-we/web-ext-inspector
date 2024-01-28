import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import DynamicAnalysisTile from "../tiles/DynamicAnalysisTile";
import FilesTile from "../tiles/FilesTile";
import MetaTile from "../tiles/MetaTile";
import PermissionsTile from "../tiles/PermissionsTile";

import { useState } from "preact/hooks";
import { startUserDownload } from "../../../utilities/download";
import ExtensionColorContext from "../contexts/ExtensionColorContext";
import ExtensionIdContext from "../contexts/ExtensionIdContext";
import "../main-section.scss";
import "./extension.scss";

type Props = {
  data: ExtensionData;
  collapse?: boolean;
};

const ExtensionView: FunctionComponent<Props> = ({ data, collapse }) => {
  const version = data.meta.version;
  const [color] = useState("rgb(26,148,255)");
  // TODO: pick unique color for each extension (custom hook?)

  return (
    <ExtensionIdContext.Provider value={data.id}>
      <ExtensionColorContext.Provider value={color}>
        <details class="main-section extension" style={`--color:${color}`} open={!collapse}>
          <summary>
            <h2>
              {data.meta.name}
              <span class="version" title={`Version ${version}`}>
                {version}
              </span>
            </h2>
            <div class="buttons" aria-label="Buttons">
              <button
                class="download"
                title="Download"
                onClick={() => startUserDownload(data.downloadUrl, "extension.zip")}
                type="button"
              />
              <button class="remove" title="Remove" type="button" />
            </div>
          </summary>
          <div class="tiles">
            <MetaTile {...data.meta} />
            <PermissionsTile {...data.permissions} />
            <FilesTile {...data.files} />
            <DynamicAnalysisTile {...data.dynamicAnalysis} />
          </div>
        </details>
      </ExtensionColorContext.Provider>
    </ExtensionIdContext.Provider>
  );
};

export default ExtensionView;

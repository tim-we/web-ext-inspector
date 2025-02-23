import type { FunctionComponent } from "preact";

import DynamicAnalysisTile from "../tiles/DynamicAnalysisTile";
import FilesTile from "../tiles/FilesTile";
import MetaTile from "../tiles/MetaTile";
import PermissionsTile from "../tiles/PermissionsTile";

import { useState } from "preact/hooks";
import { startUserDownload } from "../../../utilities/download";
import ExtensionColorContext from "../contexts/ExtensionColorContext";
import SessionContext from "../contexts/SessionContext";
import "../main-section.css";
import "./extension.css";
import type SessionProxy from "../../SessionProxy";
import TranslationsTile from "../tiles/TranslationsTile";

type Props = {
  session: SessionProxy;
  collapse?: boolean;
};

const ExtensionView: FunctionComponent<Props> = ({ session, collapse }) => {
  const { meta, permissions, files, translations, dynamicAnalysis } = session.summary;
  const [color] = useState("rgb(26,148,255)");
  // TODO: pick unique color for each extension (custom hook?)

  return (
    <SessionContext.Provider value={session}>
      <ExtensionColorContext.Provider value={color}>
        <details class="main-section extension" style={`--color:${color}`} open={!collapse}>
          <summary>
            <h2>
              {meta.name}
              <span class="version" title={`Version ${meta.version}`}>
                {meta.version}
              </span>
            </h2>
            <div class="buttons" aria-label="Buttons">
              {/* TODO: share (link) button */}
              <button
                class="download"
                title="Download"
                onClick={() => downloadExtension(session)}
                type="button"
              />
              <button class="remove" title="Remove" type="button" />
            </div>
          </summary>
          <div class="tiles">
            <MetaTile {...meta} />
            <PermissionsTile {...permissions} />
            <FilesTile {...files} />
            <TranslationsTile {...translations} />
            <DynamicAnalysisTile {...dynamicAnalysis} />
          </div>
        </details>
      </ExtensionColorContext.Provider>
    </SessionContext.Provider>
  );
};

export default ExtensionView;

async function downloadExtension(extension: SessionProxy): Promise<void> {
  // TODO: Create AsyncButton or ActionButton component for async actions
  const url = await Promise.resolve(""); // TODO get download URL
  // TODO generate filename from extension name or slug and version
  startUserDownload(url, "extension.zip");
}

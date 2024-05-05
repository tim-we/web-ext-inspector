import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { useState } from "preact/hooks";

import ExtensionIdContext from "../contexts/ExtensionIdContext";
import FilePreview from "./FilePreview";
import FolderContentView from "./FolderContentView";

import "./file-explorer.scss";

type ExplorerProps = {
  extensionId: string;
};

const FileExplorer: FunctionComponent<ExplorerProps> = ({ extensionId }) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | undefined>(undefined);

  return (
    <ExtensionIdContext.Provider value={extensionId}>
      <div class="file-explorer">
        <FolderContentView
          path="/"
          label="file explorer"
          onFileSelected={(node, path) => setSelectedFile({ node, path })}
        />
        {selectedFile ? (
          <FilePreview {...selectedFile} onClose={() => setSelectedFile(undefined)} />
        ) : null}
      </div>
    </ExtensionIdContext.Provider>
  );
};

export default FileExplorer;

type SelectedFile = {
  node: FSNodeDTO & { type: "file" };
  path: string;
};

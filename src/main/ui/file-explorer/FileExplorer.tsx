import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { StateUpdater, useState } from "preact/hooks";

import ExtensionIdContext from "../contexts/ExtensionIdContext";
import FilePreview from "./FilePreview";
import FolderContentView from "./FolderContentView";

import "./file-explorer.scss";
import SelectedFSNodeContext from "../contexts/SelectedFSNodeContext";

type ExplorerProps = {
  extensionId: string;
};

const FileExplorer: FunctionComponent<ExplorerProps> = ({ extensionId }) => {
  const [previewFile, setPreviewFile] = useState<SelectedFile | undefined>(undefined);
  const [selectedFSNode, setSelectedFSNode] = useState<string | undefined>(undefined);

  const fileSelectionHandler = (node: SelectedFile["node"], path: string) => {
    setPreviewFile({ node, path });
    setSelectedFSNode(path);
  };

  return (
    <ExtensionIdContext.Provider value={extensionId}>
      <SelectedFSNodeContext.Provider value={selectedFSNode}>
        <div class="file-explorer">
          <FolderContentView path="/" label="file explorer" onFileSelected={fileSelectionHandler} />
          {previewFile ? (
            <FilePreview {...previewFile} onClose={() => setPreviewFile(undefined)} />
          ) : null}
        </div>
      </SelectedFSNodeContext.Provider>
    </ExtensionIdContext.Provider>
  );
};

export default FileExplorer;

type SelectedFile = {
  node: FSNodeDTO & { type: "file" };
  path: string;
};

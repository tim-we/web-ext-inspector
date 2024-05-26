import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { useState } from "preact/hooks";

import ExtensionIdContext from "../contexts/ExtensionIdContext";
import FilePreview from "./FilePreview";
import FolderContentView from "./FolderContentView";

import "./file-explorer.scss";
import SelectedFSNodeContext from "../contexts/SelectedFSNodeContext";

type ExplorerProps = {
  extensionId: string;
};

const FileExplorer: FunctionComponent<ExplorerProps> = ({ extensionId }) => {
  const [previewFile, setPreviewFile] = useState<FileNodeDTO | undefined>(undefined);
  const [selectedFSNode, setSelectedFSNode] = useState<string | undefined>(undefined);

  const fileSelectionHandler = (node: FileNodeDTO) => {
    setPreviewFile(node);
    setSelectedFSNode(node.path);
  };

  return (
    <ExtensionIdContext.Provider value={extensionId}>
      <SelectedFSNodeContext.Provider value={selectedFSNode}>
        <div class="file-explorer">
          <FolderContentView
            path="/"
            label="file explorer"
            showFilePreview={fileSelectionHandler}
            selectFSNode={setSelectedFSNode}
          />
          {previewFile ? (
            <FilePreview node={previewFile} onClose={() => setPreviewFile(undefined)} />
          ) : null}
        </div>
      </SelectedFSNodeContext.Provider>
    </ExtensionIdContext.Provider>
  );
};

export default FileExplorer;

type FileNodeDTO = FSNodeDTO & { type: "file" };

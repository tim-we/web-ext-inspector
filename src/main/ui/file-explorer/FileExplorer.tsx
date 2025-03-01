import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";
import type SessionProxy from "../../SessionProxy";

import { useState } from "preact/hooks";

import SessionContext from "../contexts/SessionContext";
import FilePreview from "./FilePreview";
import FolderContentView from "./FolderContentView";

import "./file-explorer.css";
import SelectedFSNodeContext from "../contexts/SelectedFSNodeContext";

type ExplorerProps = {
  session: SessionProxy;
};

const FileExplorer: FunctionComponent<ExplorerProps> = ({ session }) => {
  const [previewFile, setPreviewFile] = useState<FileNodeDTO | undefined>(undefined);
  const [selectedFSNode, setSelectedFSNode] = useState<string | undefined>(undefined);

  const fileSelectionHandler = (node: FileNodeDTO) => {
    setPreviewFile(node);
    setSelectedFSNode(node.path);
  };

  return (
    <SessionContext.Provider value={session}>
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
    </SessionContext.Provider>
  );
};

export default FileExplorer;

type FileNodeDTO = FSNodeDTO & { type: "file" };

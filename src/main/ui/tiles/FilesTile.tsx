import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import FileExplorer from "../file-explorer/FileExplorer";
import Tile from "./Tile";

const FilesTile: FunctionComponent<ExtensionData["files"]> = ({
  javascript,
  html,
  css,
  other,
  size
}) => {
  // TODO: WebAssembly ?
  return (
    <Tile title="Files" cssClass="files" modal={createFileExplorerModalOptions}>
      <table>
        <tbody>
          <tr class={javascript === 0 ? "none" : ""}>
            <td>{javascript}</td>
            <td>JavaScript</td>
          </tr>
          <tr class={html === 0 ? "none" : ""}>
            <td>{html}</td>
            <td>HTML</td>
          </tr>
          <tr class={css === 0 ? "none" : ""}>
            <td>{css}</td>
            <td>CSS</td>
          </tr>
          <tr class={other === 0 ? "none" : ""}>
            <td>{other}</td>
            <td>other</td>
          </tr>
        </tbody>
      </table>
      <span class="total-size">{`Total size: ${size}`}</span>
    </Tile>
  );
};

export default FilesTile;

function createFileExplorerModalOptions(extensionId: string) {
  return {
    title: "File Explorer",
    icon: "file-explorer",
    content: <FileExplorer extensionId={extensionId} />,
    initialWidth: 700,
    initialHeight: 500
  };
}

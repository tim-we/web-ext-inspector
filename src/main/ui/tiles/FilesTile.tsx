import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import FileExplorer from "../file-explorer/FileExplorer";
import Tile from "./Tile";
import DonutChart from "../common/DonutChart";

import "./files-tile.css";

const FilesTile: FunctionComponent<ExtensionData["files"]> = ({
  javascript,
  html,
  css,
  json,
  other
}) => {
  const chartData = [
    { amount: javascript, color: "rgb(247, 224, 24)" },
    { amount: html, color: "rgb(229, 76, 33)" },
    { amount: css, color: "rebeccapurple" },
    { amount: json, color: "rgb(16, 182, 16)" },
    { amount: other, color: "rgb(213, 213, 213)" }
    // WASM: rgb(101, 78, 240)
  ];

  // TODO: WebAssembly ?
  return (
    <Tile title="Files" cssClass="files" popup={createFileExplorerPopupOptions}>
      <DonutChart data={chartData} />
      <div class="column">
        <table>
          <tbody>
            <tr class={javascript === 0 ? "none" : ""}>
              <td>{javascript}</td>
              <td>
                JavaScript <ChartColorIndicator color="rgb(247, 224, 24)" />
              </td>
            </tr>
            <tr class={html === 0 ? "none" : ""}>
              <td>{html}</td>
              <td>
                HTML <ChartColorIndicator color="rgb(229, 76, 33)" />
              </td>
            </tr>
            <tr class={css === 0 ? "none" : ""}>
              <td>{css}</td>
              <td>
                CSS <ChartColorIndicator color="rebeccapurple" />
              </td>
            </tr>
            <tr class={json === 0 ? "none" : ""}>
              <td>{json}</td>
              <td>
                JSON <ChartColorIndicator color="rgb(16, 182, 16)" />
              </td>
            </tr>
            <tr class={other === 0 ? "none" : ""}>
              <td>{other}</td>
              <td>
                other <ChartColorIndicator color="rgb(213, 213, 213)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Tile>
  );
};

export default FilesTile;

function createFileExplorerPopupOptions(extensionId: string) {
  return {
    title: "File Explorer",
    icon: "file-explorer",
    content: <FileExplorer extensionId={extensionId} />,
    initialWidth: 700,
    initialHeight: 500
  };
}

const ChartColorIndicator: FunctionComponent<{ color: string }> = ({ color }) => (
  <span class="chart-color-indicator" style={`background-color: ${color}`} />
);

import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import FileExplorer from "../file-explorer/FileExplorer";
import Tile from "./Tile";
import DonutChart from "../common/DonutChart";

const FilesTile: FunctionComponent<ExtensionData["files"]> = ({
  javascript,
  html,
  css,
  other,
  size
}) => {
  const chartData = [
    { amount: javascript, color: "rgb(240, 220, 78)" },
    { amount: html, color: "rgb(229, 76, 33)" },
    { amount: css, color: "rebeccapurple" },
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
                JavaScript <ChartColorIndicator color="rgb(240, 220, 78)" />
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
            <tr class={other === 0 ? "none" : ""}>
              <td>{other}</td>
              <td>
                other <ChartColorIndicator color="rgb(213, 213, 213)" />
              </td>
            </tr>
          </tbody>
        </table>
        <span class="total-size">{`Total size: ${size}`}</span>
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

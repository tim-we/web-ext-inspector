import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import FileExplorer from "../file-explorer/FileExplorer";
import Tile from "./Tile";
import DonutChart from "../common/DonutChart";

import "./files-tile.css";

const mappings: Record<FileType, { label: string; color: string }> = {
  javascript: { label: "JavaScript", color: "rgb(247, 224, 24)" },
  html: { label: "HTML", color: "rgb(229, 76, 33)" },
  css: { label: "CSS", color: "rebeccapurple" },
  json: { label: "JSON", color: "rgb(16, 182, 16)" },
  other: { label: "Other", color: "rgb(199, 199, 199)" }
  // WASM: rgb(101, 78, 240)
};

const FilesTile: FunctionComponent<ExtensionData["files"]> = (data) => {
  const chartData = Object.entries(mappings).map(([key, props]) => ({
    amount: data[key as FileType],
    color: props.color
  }));

  // TODO: WebAssembly ?
  return (
    <Tile title="Files" cssClass="files" popup={createFileExplorerPopupOptions}>
      <DonutChart data={chartData} />
      <div class="column">
        <table>
          <tbody>
            {Object.entries(mappings).map(([key, value]) => (
              <tr key={key} class={data[key as FileType] === 0 ? "none" : ""}>
                <td>{data[key as FileType]}</td>
                <td>
                  {value.label} <ChartColorIndicator color={value.color} />
                </td>
              </tr>
            ))}
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

type FileType = keyof ExtensionData["files"];

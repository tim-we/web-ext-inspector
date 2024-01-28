import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import PermissionsViewer from "../permissions/PermissionsViewer";
import Tile from "./Tile";

const PermissionsTile: FunctionComponent<ExtensionData["permissions"]> = ({
  required,
  optional,
  host
}) => (
  <Tile title="Permissions" cssClass="permissions" modal={createModalOptions}>
    <table>
      <tbody>
        <tr>
          <td>{required}</td>
          <td>required</td>
        </tr>
        <tr>
          <td>{optional}</td>
          <td>optional</td>
        </tr>
        <tr>
          <td>{host}</td>
          <td>host</td>
        </tr>
      </tbody>
    </table>
  </Tile>
);

export default PermissionsTile;

function createModalOptions(extensionId: ExtensionData["id"]) {
  return {
    title: "Permissions",
    content: <PermissionsViewer extId={extensionId} />
  };
}

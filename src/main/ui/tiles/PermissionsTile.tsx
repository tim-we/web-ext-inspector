import type { FunctionComponent } from "preact";
import PermissionsViewer from "../permissions/PermissionsViewer";
import Tile from "./Tile";
import type { ExtensionSummary } from "../../../extension/types/ExtensionSummary";
import type SessionProxy from "../../SessionProxy";

const PermissionsTile: FunctionComponent<ExtensionSummary["permissions"]> = ({
  required,
  optional,
  host
}) => (
  <Tile title="Permissions" cssClass="permissions" popup={createPopupOptions}>
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

function createPopupOptions(session: SessionProxy) {
  return {
    title: "Permissions",
    content: <PermissionsViewer session={session} />
  };
}

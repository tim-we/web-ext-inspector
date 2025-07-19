import type { FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { PermissionsInfo } from "../../../extension/Extension";

import Permission from "./Permission";

import "./permissions.css";
import type SessionProxy from "../../SessionProxy";

type ViewerProps = { session: SessionProxy };

const PermissionsViewer: FunctionComponent<ViewerProps> = ({ session }) => {
  const [permissions, setPermissions] = useState<PermissionsInfo | undefined>(undefined);

  useEffect(() => {
    session.getPermissions().then(setPermissions, (e) => console.error(e));
  }, [session]);

  if (permissions === undefined) {
    return <span>...</span>;
  }

  // TODO
  return (
    <>
      <fieldset>
        <legend>API</legend>
        <div class="permission-set">
          {permissions.api.required.map((p) => (
            <Permission key={p} name={p} required={true} />
          ))}
          {permissions.api.optional.map((p) => (
            <Permission key={p} name={p} required={false} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Host</legend>
        <div class="permission-set">
          {permissions.host.required.map((p) => (
            <Permission key={p} host={p} required={true} />
          ))}
          {permissions.host.optional.map((p) => (
            <Permission key={p} host={p} required={false} />
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default PermissionsViewer;

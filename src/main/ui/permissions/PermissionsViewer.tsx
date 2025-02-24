import type { FunctionComponent } from "preact";
import type { PermissionsInfo } from "../../../extension/Extension";

import { useEffect, useState } from "preact/hooks";

import wrappedWorker from "../../MainWorkerRef";
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
        {permissions.api.required.map((p) => (
          <Permission key={p} name={p} required={true} />
        ))}
        {permissions.api.optional.map((p) => (
          <Permission key={p} name={p} required={false} />
        ))}
      </fieldset>
      <fieldset>
        <legend>Host</legend>
        {permissions.host.required.map((p) => (
          <Permission key={p} host={p} required={true} />
        ))}
        {permissions.host.optional.map((p) => (
          <Permission key={p} host={p} required={false} />
        ))}
      </fieldset>
    </>
  );
};

export default PermissionsViewer;

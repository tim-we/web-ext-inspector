import type { FunctionComponent } from "preact";
import type { PermissionsInfo } from "../../../extension/Extension";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import { useEffect, useState } from "preact/hooks";

import wrappedWorker from "../../MainWorkerRef";
import Permission from "./Permission";

import "./permissions.scss";

type ViewerProps = { extId: ExtensionId };

const PermissionsViewer: FunctionComponent<ViewerProps> = ({ extId }) => {
  const [permissions, setPermissions] = useState<PermissionsInfo | undefined>(undefined);

  useEffect(() => {
    wrappedWorker.getPermissions(extId).then(setPermissions, (e) => console.error(e));
  }, [extId]);

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

type ExtensionId = ExtensionData["id"];

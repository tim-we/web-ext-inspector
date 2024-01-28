import type { FunctionComponent } from "preact";

type PermissionProps = { name: string; required: boolean } | { host: string; required: boolean };

const Permission: FunctionComponent<PermissionProps> = (props) => {
  const classes = ["permission", props.required ? "required" : "optional"];

  const label = "name" in props ? props.name : props.host;

  return <span class={classes.join(" ")}>{label}</span>;
};

export default Permission;

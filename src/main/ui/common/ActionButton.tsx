import type { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

const ActionButton: FunctionComponent<Props> = ({
  action,
  disabled,
  submit,
  tooltip,
  icon,
  children
}) => {
  const [active, setActive] = useState<boolean>(false);
  const onClick = async () => {
    const maybePromise = action();
    if (!(maybePromise instanceof Promise)) {
      return;
    }
    setActive(true);
    await maybePromise;
    setActive(false);
  };

  return (
    <button
      type={submit ? "submit" : "button"}
      class={icon ? "action with-icon" : "action"}
      disabled={disabled || active}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </button>
  );
};

export default ActionButton;

type Props = {
  action: () => Promise<unknown> | unknown;
  tooltip?: string;
  submit?: boolean;
  disabled?: boolean;
  icon?: string | boolean;
};

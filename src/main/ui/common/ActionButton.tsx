import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

const ActionButton: FunctionComponent<Props> = ({ action, title, children }) => {
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
    <button type="button" class="action" disabled={active} onClick={onClick} title={title}>
      {children}
    </button>
  );
};

export default ActionButton;

type Props = {
  action: () => Promise<unknown> | unknown;
  title?: string;
};

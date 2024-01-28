import type { FunctionComponent } from "preact";
import { useRef } from "preact/hooks";
import type { FSNodeDTO } from "../../../extension/FileSystem";
import * as paths from "../../../utilities/paths";

import TagList from "./TagList";
import "./file-preview.scss";

type Props = {
  path: string;
  node: FSNodeDTO & { type: "file" };
  onClose?: () => void;
};

const FilePreview: FunctionComponent<Props> = ({ path, node, onClose }) => {
  const folder = paths.dirname(path);
  const elementRef = useRef<HTMLElement>(null);

  const closeFn = async () => {
    await elementRef.current!.animate(
      [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(200px)" }
      ],
      { duration: 125, easing: "ease-in", fill: "forwards" }
    ).finished;
    onClose?.();
  };

  return (
    <article class="file-preview" ref={elementRef}>
      <section class="properties">
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <td>{node.name}</td>
            </tr>
            {folder !== "" ? (
              <tr>
                <th>Folder</th>
                <td>{folder.replace(/^\//, "")}</td>
              </tr>
            ) : null}
            <tr>
              <th>Size</th>
              <td>{node.size}</td>
            </tr>
          </tbody>
        </table>
        <TagList tags={node.tags} showAll={true} />
      </section>
      {onClose ? (
        <button onClick={closeFn} class="close" title="hide preview" type="button" />
      ) : null}
    </article>
  );
};

export default FilePreview;

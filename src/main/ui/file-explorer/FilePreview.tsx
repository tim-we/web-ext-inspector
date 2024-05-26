import type { FunctionComponent } from "preact";
import { useContext, useRef, useState } from "preact/hooks";
import type { FSNodeDTO } from "../../../extension/FileSystem";
import * as paths from "../../../utilities/paths";
import wrappedWorker from "../../MainWorkerRef";
import ExtensionIdContext from "../contexts/ExtensionIdContext";
import TagList from "./TagList";

import ActionButton from "../common/ActionButton";
import "./file-preview.scss";

const closeAnimationKeyframes: Keyframe[] = [
  { opacity: 1, transform: "translateX(0)" },
  { opacity: 0, transform: "translateX(200px)" }
];

const FilePreview: FunctionComponent<FilePreviewProps> = ({ node, onClose }) => {
  const path = node.path;
  const folder = paths.dirname(path);
  const elementRef = useRef<HTMLElement>(null);

  const closeFn = async () => {
    await elementRef.current!.animate(closeAnimationKeyframes, {
      duration: 125,
      easing: "ease-in",
      fill: "forwards"
    }).finished;
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
      <PreviewButtons node={node} />
      {onClose ? (
        <button onClick={closeFn} class="close" title="hide preview" type="button" />
      ) : null}
    </article>
  );
};

export default FilePreview;

const PreviewButtons: FunctionComponent<PreviewButtonsProps> = ({ node }) => {
  const extId = useContext(ExtensionIdContext)!;
  const isAudio = node.tags.includes("audio");
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const playFn = async () => {
    const url = await wrappedWorker.getFileDownloadUrl(extId, node.path);
    const audio = new Audio(url);
    await audio.play();
    setAudioElement(audio);
    audio.addEventListener("ended", () => setAudioElement(null), { once: true });
  };

  const stopFn = () => {
    audioElement?.pause();
    setAudioElement(null);
  };

  const isPlaying = audioElement && !audioElement.ended;

  const downloadFn = async () => {
    const a = document.createElement("a");
    a.href = await wrappedWorker.getFileDownloadUrl(extId, node.path);
    a.download = node.name;
    a.click();
  };

  return (
    <section class="buttons">
      {isAudio ? (
        <ActionButton tooltip={`play ${node.name}`} action={isPlaying ? stopFn : playFn}>
          {isPlaying ? "Pause" : "Play"}
        </ActionButton>
      ) : null}
      <ActionButton tooltip={`download ${node.name}`} action={downloadFn}>
        Download
      </ActionButton>
    </section>
  );
};

type FilePreviewProps = {
  node: FileNode;
  onClose?: () => void;
};

type PreviewButtonsProps = Pick<FilePreviewProps, "node">;

type FileNode = FSNodeDTO & { type: "file" };

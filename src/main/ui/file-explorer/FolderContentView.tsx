import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import * as paths from "../../../utilities/paths";
import wrappedWorker from "../../MainWorkerRef";
import { openCodeViewer } from "../code-viewer/CodeViewer";
import ExtensionIdContext from "../contexts/ExtensionIdContext";
import TagList from "./TagList";

const noop = () => undefined;
const FSHContext = createContext<FileSelectedHandler>(noop);

const FolderContentView: FunctionComponent<FolderProps> = ({ path, onFileSelected }) => {
  const extId = useContext(ExtensionIdContext)!;
  const [contents, setContents] = useState<FSNodeDTO[] | undefined>(undefined);

  useEffect(() => {
    wrappedWorker
      .getDirectoryContents(extId, path)
      .then((children) => setContents(children.sort(compareFSNodes)))
      .catch((e) => console.error(e));
  }, [extId, path]);

  if (contents === undefined) {
    return <span class="folder-content">...</span>;
  }

  const folders = contents.filter((node) => node.type === "folder") as FolderDTO[];
  const files = contents.filter((node) => node.type === "file") as FileDTO[];

  const jsxContent = (
    <ul class="folder-content" role="tree">
      {folders.map((folder) => (
        <FolderView key={folder.name} {...folder} />
      ))}
      {files.map((file) => (
        <FileView key={file.name} path={paths.join(path, file.name)} node={file} />
      ))}
    </ul>
  );

  if (onFileSelected) {
    return <FSHContext.Provider value={onFileSelected}>{jsxContent}</FSHContext.Provider>;
  }

  return jsxContent;
};

export default FolderContentView;

const FileView: FunctionComponent<{ node: FileDTO; path: string }> = ({ node, path }) => {
  const onSelect = useContext(FSHContext);
  const extId = useContext(ExtensionIdContext)!;

  const clickHandler = onSelect ? () => onSelect(node, path) : undefined;
  const isCodeOrText = node.tags.includes("code") || node.tags.includes("text");
  const dblClickHanlder = isCodeOrText ? () => openCodeViewer(extId, path) : undefined;

  return (
    <li class={["file", ...node.tags].join(" ")} role="treeitem">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: TODO */}
      <span class="name" onClick={clickHandler} onDblClick={dblClickHanlder}>
        {node.name}
      </span>
      <span class="item-info">{node.size}</span>
      <TagList tags={node.tags} />
    </li>
  );
};

const FolderView: FunctionComponent<FolderDTO & { path: string }> = ({ name, path }) => {
  const [renderContent, setRenderContent] = useState(false);

  const toggleHandler = renderContent
    ? undefined
    : (e: Event) => {
        if ((e.target as HTMLDetailsElement).open) {
          setRenderContent(true);
        }
      };

  return (
    <li class="folder" role="treeitem">
      <details onToggle={toggleHandler}>
        <summary>
          <span class="name">{name}</span>
          <span class="separator" aria-hidden={true}>
            /
          </span>
        </summary>
        {renderContent ? <FolderContentView path={path} /> : null}
      </details>
    </li>
  );
};

const collator = new Intl.Collator("en");

function compareFSNodes(a: FSNodeDTO, b: FSNodeDTO) {
  if (a.type !== b.type) {
    // Folders before files.
    return a.type === "folder" ? -1 : 1;
  }

  return collator.compare(a.name, b.name);
}

type FileDTO = FSNodeDTO & { type: "file" };
type FolderDTO = FSNodeDTO & { type: "folder" };

type FolderProps = {
  path: string;
  onFileSelected?: FileSelectedHandler;
};

type FileSelectedHandler = (node: FileDTO, path: string) => void;

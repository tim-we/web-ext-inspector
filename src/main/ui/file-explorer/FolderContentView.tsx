import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { createContext } from "preact";
import { useContext, useEffect, useId, useRef, useState } from "preact/hooks";

import * as paths from "../../../utilities/paths";
import wrappedWorker from "../../MainWorkerRef";
import { openCodeViewer } from "../code-viewer/CodeViewer";
import ExtensionIdContext from "../contexts/ExtensionIdContext";
import TagList from "./TagList";

const noop = () => undefined;
const FSHContext = createContext<FileSelectedHandler>(noop);

const FolderContentView: FunctionComponent<FolderProps> = ({
  path,
  label,
  hasSelection,
  onFileSelected
}) => {
  const extId = useContext(ExtensionIdContext)!;
  const [contents, setContents] = useState<FSNodeDTO[] | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number>(hasSelection ? 0 : -1);
  const ulRef = useRef<HTMLUListElement>(null);

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
  const isRoot = path === "/" || path === "";

  // TODO: keydown listener

  const jsxContent = (
    <ul
      ref={ulRef}
      class="folder-content"
      role={isRoot ? "tree" : "group"}
      aria-label={isRoot ? label : undefined}
      tabindex={0}
    >
      {folders.map((folder, i) => (
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

const FileView: FunctionComponent<{ node: FileDTO; path: string; selected?: boolean }> = ({
  node,
  path,
  selected = false
}) => {
  const onSelect = useContext(FSHContext);
  const extId = useContext(ExtensionIdContext)!;
  const labelId = useId();

  const clickHandler = onSelect ? () => onSelect(node, path) : undefined;
  const isCodeOrText = node.tags.includes("code") || node.tags.includes("text");
  const dblClickHanlder = isCodeOrText ? () => openCodeViewer(extId, path) : undefined;

  return (
    <li
      class={["file", ...node.tags].join(" ")}
      role="treeitem"
      aria-labelledby={labelId}
      aria-selected={selected}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: TODO */}
      <a id={labelId} class="name" onClick={clickHandler} onDblClick={dblClickHanlder} tabindex={0}>
        {node.name}
      </a>
      <span class="item-info">{node.size}</span>
      <TagList tags={node.tags} />
    </li>
  );
};

const FolderView: FunctionComponent<FolderDTO & { path: string; selected?: boolean }> = ({
  name,
  path,
  selected = false
}) => {
  const [renderContent, setRenderContent] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const labelId = useId();

  const toggleHandler = (e: Event) => {
    setExpanded(!expanded);
    if (renderContent) {
      return;
    }
    if ((e.target as HTMLDetailsElement).open) {
      setRenderContent(true);
    }
  };

  // TODO: hasSelection
  return (
    <li
      class="folder"
      role="treeitem"
      aria-expanded={expanded}
      aria-labelledby={labelId}
      aria-selected={selected}
    >
      <details onToggle={toggleHandler}>
        <summary>
          <span id={labelId} class="name">
            {name}
          </span>
          <span class="separator" aria-hidden={true}>
            /
          </span>
        </summary>
        {renderContent ? <FolderContentView path={path} hasSelection={false} /> : null}
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
  label?: string;
  hasSelection: boolean;
  onFileSelected?: FileSelectedHandler;
};

type FileSelectedHandler = (node: FileDTO, path: string) => void;

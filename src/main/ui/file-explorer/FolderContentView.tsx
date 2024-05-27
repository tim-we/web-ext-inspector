import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { createContext } from "preact";
import { useContext, useEffect, useId, useRef, useState } from "preact/hooks";

import * as paths from "../../../utilities/paths";
import wrappedWorker from "../../MainWorkerRef";
import { openCodeViewer } from "../code-viewer/CodeViewer";
import ExtensionIdContext from "../contexts/ExtensionIdContext";
import SelectedFSNodeContext from "../contexts/SelectedFSNodeContext";
import TagList from "./TagList";

const noop = () => undefined;
const FSHContext = createContext<FSNodeSelectionHandler>(noop);

const FolderContentView: FunctionComponent<FCVProps> = ({
  path,
  label,
  showFilePreview,
  selectFSNode
}) => {
  const extId = useContext(ExtensionIdContext)!;
  const selectedPath = useContext(SelectedFSNodeContext);
  const [contents, setContents] = useState<FSNodeDTO[] | undefined>(undefined);
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

  const selectionDirname = selectedPath === undefined ? undefined : paths.dirname(selectedPath);
  const folders = contents.filter((node) => node.type === "folder") as FolderDTO[];
  const files = contents.filter((node) => node.type === "file") as FileDTO[];
  const isRoot = path === "/" || path === "";

  const keydownListener = (e: KeyboardEvent) => {
    if (selectionDirname !== path) {
      return;
    }

    if (e.key !== "Enter" && !arrowKeys.has(e.key)) {
      return;
    }

    // Prevent scrolling.
    e.preventDefault();

    const index = contents.findIndex((node) => node.path === selectedPath);

    if (index < 0) {
      // TODO folder paths start with '/', file paths don't. Why? FIX!
      return;
    }

    if (e.key === "Enter") {
      e.stopPropagation();
      const node = contents[index];
      if (node.type === "file") {
        showFilePreview?.(node);
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const direction = e.key === "ArrowDown" ? 1 : -1;
      const nextNode = contents[index + direction];
      if (nextNode === undefined) {
        console.log("next node not found", direction, contents.length, index);
        // TODO
        return;
      }
      e.stopPropagation();
      selectFSNode?.(nextNode.path);
      return;
    }

    // TODO: scroll selected node into view
  };

  const jsxContent = (
    <ul
      ref={ulRef}
      class="folder-content"
      role={isRoot ? "tree" : "group"}
      aria-label={isRoot ? label : undefined}
      tabindex={0}
      onKeyDown={keydownListener}
    >
      {folders.map((folder, i) => (
        <FolderView key={folder.name} node={folder} selectFSNode={selectFSNode} />
      ))}
      {files.map((file) => (
        <FileView key={file.name} node={file} />
      ))}
    </ul>
  );

  if (showFilePreview) {
    return <FSHContext.Provider value={showFilePreview}>{jsxContent}</FSHContext.Provider>;
  }

  return jsxContent;
};

export default FolderContentView;

const FileView: FunctionComponent<{ node: FileDTO }> = ({ node }) => {
  const onSelect = useContext(FSHContext);
  const extId = useContext(ExtensionIdContext)!;
  const selectedPath = useContext(SelectedFSNodeContext);
  const labelId = useId();

  const path = node.path;
  const selected = selectedPath === path;
  const clickHandler = onSelect ? () => onSelect(node, path) : undefined;
  const isCodeOrText = node.tags.includes("code") || node.tags.includes("text");
  const dblClickHanlder = isCodeOrText
    ? () => {
        // Clear accidental selection.
        window.getSelection()?.empty();
        // Open file.
        openCodeViewer(extId, path);
      }
    : undefined;

  return (
    <li
      class={["file", ...node.tags].join(" ")}
      role="treeitem"
      aria-labelledby={labelId}
      aria-selected={selected}
      data-path={path}
    >
      <a id={labelId} class="name" onClick={clickHandler} onDblClick={dblClickHanlder} tabindex={0}>
        {node.name}
      </a>
      <span class="item-info">{node.size}</span>
      <TagList tags={node.tags} />
    </li>
  );
};

const FolderView: FunctionComponent<{node: FolderDTO, selectFSNode?: FSNodeSelector}> = ({ node, selectFSNode }) => {
  const [renderContent, setRenderContent] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const selectedPath = useContext(SelectedFSNodeContext);
  const labelId = useId();

  const selected = selectedPath === node.path;

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
      data-path={node.path}
    >
      <details onToggle={toggleHandler}>
        <summary>
          <span id={labelId} class="name">
            {node.name}
          </span>
          <span class="separator" aria-hidden={true}>
            /
          </span>
        </summary>
        {renderContent ? <FolderContentView path={node.path} selectFSNode={selectFSNode}/> : null}
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

const arrowKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

type FileDTO = FSNodeDTO & { type: "file" };
type FolderDTO = FSNodeDTO & { type: "folder" };

type FCVProps = {
  path: string;
  label?: string;
  showFilePreview?: (file: FileDTO) => unknown;
  selectFSNode?: FSNodeSelector;
};

type FSNodeSelector = (path: FSNodeDTO["path"]) => unknown;
type FSNodeSelectionHandler = (node: FileDTO, path: string) => void;

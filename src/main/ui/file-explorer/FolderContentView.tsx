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
import { scrollIntoViewIfNeeded } from "../../../utilities/dom";

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
    wrappedWorker.getDirectoryContents(extId, path).then(setContents, (e) => console.error(e));
  }, [extId, path]);

  if (contents === undefined) {
    return <span class="folder-content">...</span>;
  }

  const selectionDirname = selectedPath === undefined ? undefined : paths.dirname(selectedPath);
  const folders = contents.filter((node) => node.type === "folder") as FolderDTO[];
  const files = contents.filter((node) => node.type === "file") as FileDTO[];
  const isRoot = path === "/" || path === "";

  const keydownListener = async (e: KeyboardEvent) => {
    if (selectedPath === undefined) {
      // No selection -> no selection change.
      return;
    }
    if (!selectionDirname!.startsWith(path)) {
      // Keyboard interaction not relevant for the current subtree.
      return;
    }

    if (e.key !== "Enter" && !arrowKeys.has(e.key)) {
      return;
    }

    // Prevent scrolling.
    e.preventDefault();

    // We check for prefix such that we can let the event bubble up and let the parent handle this.
    const index = contents.findIndex((node) => node.path.startsWith(selectedPath));

    if (index < 0) {
      return;
    }

    const currentNode = contents[index];

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
        // Next node not found (out of bounds), let parent handle this.
        return;
      }
      e.stopPropagation();
      selectFSNode?.(nextNode.path);
      return;
    } else if (e.key === "ArrowLeft" && !isRoot) {
      e.stopPropagation();
      selectFSNode?.(path);
    } else if (e.key === "ArrowRight" && currentNode.type === "folder") {
      e.stopPropagation();
      const folderContents = await wrappedWorker.getDirectoryContents(extId, currentNode.path);
      selectFSNode?.(folderContents[0].path);
    }
  };

  // TODO: listen to focus changes

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
  const liRef = useRef<HTMLLIElement>(null);

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

  useEffect(() => {
    if (selected) {
      document.getElementById(labelId)!.focus();
      scrollIntoViewIfNeeded(liRef.current!);
    }
  }, [selected, liRef.current]);

  return (
    <li
      ref={liRef}
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

const FolderView: FunctionComponent<{ node: FolderDTO; selectFSNode?: FSNodeSelector }> = ({
  node,
  selectFSNode
}) => {
  const [expanded, setExpanded] = useState(false);
  // If we collapse the folder we keep the children, s.t. they can keep their state.
  const [renderContent, setRenderContent] = useState(false);
  const selectedPath = useContext(SelectedFSNodeContext);
  const labelId = useId();
  const liRef = useRef<HTMLLIElement>(null);

  const selected = selectedPath === node.path;

  const toggleHandler = (e: Event) => {
    setExpanded(!expanded);
    selectFSNode?.(node.path);
    if (renderContent) {
      return;
    }
    if ((e.target as HTMLDetailsElement).open) {
      setRenderContent(true);
    }
  };

  useEffect(() => {
    if (selected) {
      liRef.current!.querySelector("summary")!.focus();
      scrollIntoViewIfNeeded(liRef.current!);
    }
  }, [selected, liRef.current]);

  return (
    <li
      ref={liRef}
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
        {renderContent ? <FolderContentView path={node.path} selectFSNode={selectFSNode} /> : null}
      </details>
    </li>
  );
};

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

import type { FunctionComponent } from "preact";
import type { FSNodeDTO } from "../../../extension/FileSystem";

import { createContext } from "preact";
import { useContext, useEffect, useId, useRef, useState } from "preact/hooks";

import { scrollIntoViewIfNeeded } from "../../../utilities/dom";
import * as paths from "../../../utilities/paths";
import wrappedWorker from "../../MainWorkerRef";
import { openCodeViewer } from "../code-viewer/CodeViewer";
import SessionContext from "../contexts/SessionContext";
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
  const session = useContext(SessionContext)!;
  const selectedPath = useContext(SelectedFSNodeContext);
  const [contents, setContents] = useState<FSNodeDTO[] | undefined>(undefined);
  const ulRef = useRef<HTMLUListElement>(null);

  const isRoot = path === "/" || path === "";

  useEffect(() => {
    session.getDirectoryContents(path).then(setContents, (e) => console.error(e));
  }, [session, path]);

  if (contents === undefined) {
    return <span class="folder-content">...</span>;
  }

  const folders = contents.filter((node) => node.type === "folder") as FolderDTO[];
  const files = contents.filter((node) => node.type === "file") as FileDTO[];

  // TODO: listen to focus changes

  const keydownHandler = async (e: KeyboardEvent) => {
    // TODO check what selectedPath is
    if (selectedPath === undefined || !selectFSNode) {
      return;
    }
    e.preventDefault();
    const next = await session.changeFileSystemCursor(selectedPath, e.key);
    selectFSNode(next);
  };

  const jsxContent = (
    <ul
      ref={ulRef}
      class="folder-content"
      role={isRoot ? "tree" : "group"}
      aria-label={isRoot ? label : undefined}
      onKeyDown={isRoot ? keydownHandler : undefined}
      tabindex={0}
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
  const extId = useContext(SessionContext)!;
  const selectedPath = useContext(SelectedFSNodeContext);
  const labelId = useId();
  const liRef = useRef<HTMLLIElement>(null);

  const path = node.path;
  const selected = selectedPath === path;
  const clickHandler = onSelect ? () => onSelect(node, path) : undefined;
  const isCodeOrText = node.tags.includes("code") || node.tags.includes("text");
  const dblClickHandler = isCodeOrText
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
  }, [selected, labelId]);

  return (
    <li
      ref={liRef}
      class={["file", ...node.tags].join(" ")}
      role="treeitem"
      aria-labelledby={labelId}
      aria-selected={selected}
      data-path={path}
    >
      <a id={labelId} class="name" onClick={clickHandler} onDblClick={dblClickHandler} tabindex={0}>
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

  useEffect(() => {
    if (selected) {
      liRef.current!.querySelector("summary")!.focus();
      scrollIntoViewIfNeeded(liRef.current!);
    }
  }, [selected]);

  useEffect(() => {
    if (expanded || !selectedPath || !selectFSNode) {
      return;
    }
    if (selectedPath.startsWith(node.path)) {
      // Folder is closed and new selection is somewhere inside.
      selectFSNode(node.path);
    }
  }, [selectedPath, node.path, expanded, selectFSNode]);

  const summaryClickHandler = (e: MouseEvent) => {
    e.preventDefault();

    setExpanded(!expanded);
    selectFSNode?.(node.path);

    if (renderContent) {
      return;
    }

    if (!expanded) {
      setRenderContent(true);
    }
  };

  const keyDownHandler = async (e: KeyboardEvent) => {
    if (expanded && e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();

      if (selected) {
        setExpanded(false);
      } else {
        selectFSNode?.(node.path);
      }
    } else if (!expanded && e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();

      // Open folder.
      setRenderContent(true);
      setExpanded(true);
    }
  };

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
      <details onKeyDown={keyDownHandler} open={expanded}>
        <summary onClick={summaryClickHandler}>
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

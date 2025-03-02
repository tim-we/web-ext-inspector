import { FSFile, FSFolder, type FSNode } from "./FileSystem";

export function move(root: FSFolder, currentPosition: string, key: KeyboardEvent["key"]): FSNode {
  const currentNode = root.getNode(currentPosition);
  if (!currentNode) {
    throw new Error(`[FSCursor] File "${currentPosition}" not found.`);
  }

  const findNextNode = () => {
    if (key === "ArrowLeft") {
      return currentNode.parent;
    }

    if (key === "ArrowRight" && currentNode instanceof FSFile) {
      return currentNode;
    }

    if (key === "ArrowRight" && currentNode instanceof FSFolder) {
      // Folders are never empty so a child should always exist.
      return currentNode.children.values().next().value;
    }

    if (key !== "ArrowUp" && key !== "ArrowDown") {
      throw new Error(`[FSCursor] Unhandled key: "${key}"`);
    }

    // Traverse tree up & down to find the next node.
    let nextCandidate: FSNode | null = null;

    if (currentNode instanceof FSFolder && key === "ArrowDown") {
      // A folder is never empty.
      nextCandidate = [...currentNode.children.values()].at(0)!;
      // Problem: we don't know if the folder is open or closed
      // Solution (maybe): Send list/set of open folders
    } else {
      const direction = key === "ArrowDown" ? 1 : -1;
      let current = currentNode;

      // Move up to the correct list of siblings.
      while (true) {
        const siblings = Array.from(current.parent?.children?.values() ?? []);
        const nextIndex = siblings.indexOf(current) + direction;
        if (nextIndex === -1 || nextIndex === siblings.length) {
          if (current.parent === undefined) {
            // Reached the root node, cannot move up or down.
            return currentNode;
          }
          if (nextIndex === -1) {
            // The parent is rendered above the list of children.
            return current.parent;
          }
          current = current.parent;
          continue;
        }
        nextCandidate = siblings[nextIndex];
        break;
      }
    }

    // Move down to the correct node which is visually next to currentNode.
    while (nextCandidate instanceof FSFolder) {
      // Folders are never empty (!)
      if (key === "ArrowDown") {
        nextCandidate = [...nextCandidate.children.values()].at(0)!;
      } else {
        nextCandidate = [...nextCandidate.children.values()].at(-1)!;
      }
    }

    return nextCandidate;
  };

  const nextNode = findNextNode();

  if (nextNode === root) {
    // Root should not be selectable by keyboard navigation.
    return currentNode;
  }

  return nextNode ?? currentNode;
}

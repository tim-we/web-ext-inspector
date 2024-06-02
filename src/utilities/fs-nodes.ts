import type { FSNodeDTO } from "../extension/FileSystem";

const collator = new Intl.Collator("en");

export function compareFSNodes(a: FSNodeDTO, b: FSNodeDTO) {
  if (a.type !== b.type) {
    // Folders before files.
    return a.type === "folder" ? -1 : 1;
  }

  return collator.compare(a.name, b.name);
}

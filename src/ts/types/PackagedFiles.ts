import { TreeNodeDTO } from "../inspector/worker/FileTree";

export type TreeFileDTO = TreeNodeDTO & { type: "file" };
export type TreeFolderDTO = TreeNodeDTO & { type: "folder" };

export type FileSelectListener = (path: string, file: TreeFileDTO) => void;
export type FileAsyncAction = (path: string, file: TreeFileDTO) => Promise<void>;

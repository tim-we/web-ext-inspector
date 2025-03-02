import { FileDown, Link, Plus, Share2, Trash2 } from "lucide-preact";

const strokeWidth = 1.6;

export const DownloadFileIcon = () => <FileDown strokeWidth={strokeWidth} />;

export const RemoveIcon = () => <Trash2 strokeWidth={strokeWidth} />;

export const AddIcon = () => <Plus strokeWidth={strokeWidth} />;

export const ShareIcon = () => <Share2 strokeWidth={strokeWidth} />;

export const LinkIcon = () => <Link strokeWidth={strokeWidth} />;

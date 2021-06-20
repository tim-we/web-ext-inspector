export type ExtensionDetails = {
    source: "AMO" | "url";
    authors: string[];
    name: string;
    last_updated?: string;
    created?: string;
    icon_url?: string;
    version: string;
    size: number;
    download_url: string;
};

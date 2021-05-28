const API = "https://addons.mozilla.org/api/v5";

export type Details = {
    id: number;
    authors: any[];
    current_version: Version;
    guid: string;
    icon_url: string;
    name: { [key: string] : string };
    last_updated: string;
    slug: string;
    url: string;
}

type Version = {
    id: number;
    channel: "unlisted" | "listed";
    files: File[];
    version: string;
    compatibility: any;
};

type File = {
    id: number;
    created: string;
    hash: string;
    is_mozilla_signed_extension: boolean;
    is_restart_required: boolean;
    is_webextension: boolean;
    optional_permissions: string[];
    permissions: string[];
    size: number;
    status: string;
    url: string;
}

export async function getInfo(slug: string):Promise<Details> {
    const response = await fetch(`${API}/addons/addon/${slug}/`);
    return response.json();
}

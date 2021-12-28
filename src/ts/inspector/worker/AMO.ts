/**
 * API docs:
 * https://addons-server.readthedocs.io/en/latest/topics/api/addons.html#detail
 */

const API = "https://addons.mozilla.org/api/v5";

export type Details = {
    id: number;
    authors: ExtensionAuthor[];
    current_version: Version;
    guid: string;
    icon_url: string;
    name: { [key: string]: string };
    last_updated: string;
    created: string;
    slug: string;
    url: string;
};

type ExtensionAuthor = {
    id: number;
    name: string;
    url: string;
    username: string;
};

type Version = {
    id: number;
    channel: "unlisted" | "listed";
    file: File;
    version: string;
    compatibility: any;
};

type File = {
    id: number;
    created: string;
    hash: string;
    is_mozilla_signed_extension: boolean;
    optional_permissions: string[];
    permissions: string[];
    size: number;
    status: string;
    url: string;
};

export async function getInfo(slug: string): Promise<Details> {
    const response = await fetch(`${API}/addons/addon/${slug}/`);
    return response.json();
}

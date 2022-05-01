import { ExtensionId } from "../../types/ExtensionId";
import Extension from "./Extension";
import { update, get } from "idb-keyval";
import * as AMOAPI from "./AMO";
import * as CWS from "./CWS";
import { fetchWithCache } from "./helpers/CacheHelper";

type ExtensionCacheInfo = {
    url: string;
    date: Date;
    version: string;
    name: string;
};

type ExtCacheMap = Map<string, ExtensionCacheInfo>;

const CACHED_EXTENSIONS_KEY = "cachedExtensions";

export async function getExtension(ext: ExtensionId): Promise<Extension> {
    update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, (m) => m ?? new Map());
    const cachedExtensions = (await get<ExtCacheMap>("cachedExtensions"))!;
    const cacheInfo = cachedExtensions.get(extKey(ext));

    let downloadUrl: string;

    if (ext.source === "firefox") {
        if (cacheInfo) {
            downloadUrl = cacheInfo.url;
        } else {
            const info = await AMOAPI.getInfo(ext.id);
            downloadUrl = info.current_version.file.url;
        }
    } else if (ext.source === "chrome") {
        downloadUrl = CWS.getProxiedDownloadURL(ext.id);
    } else if (ext.source === "url") {
        downloadUrl = ext.url;
    } else {
        throw new Error("unreachable");
    }

    const response = await fetchWithCache(downloadUrl, "extensions");

    if (!response.ok) {
        return Promise.reject(
            `Failed to download extension. ${response.statusText} (${response.status})`
        );
    }

    const extension = await Extension.create(ext, await response.blob());

    update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, (m) =>
        m!.set(extKey(ext), {
            url: downloadUrl,
            date: new Date(),
            version: extension.details.version,
            name: extension.details.name,
        })
    );

    return extension;
}

function extKey(id: ExtensionId): string {
    return id.source === "url"
        ? `${id.source}.${id.url}`
        : `${id.source}.${id.id}`;
}

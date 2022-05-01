import { ExtensionId } from "../../types/ExtensionId";
import { update, get } from "idb-keyval";
import * as AMOAPI from "./AMO";
import * as CWS from "./CWS";
import { fetchWithCache } from "./helpers/CacheHelper";

type ExtensionData = {
    ext: ExtensionId;
    blob: Blob;
};

type ExtensionCacheInfo = {
    url: string;
    date: Date;
    version: string;
    name: string;
};

type ExtCacheMap = Map<string, ExtensionCacheInfo>;

const CACHED_EXTENSIONS_KEY = "cachedExtensions";

export async function getExtension(ext: ExtensionId): Promise<ExtensionData> {
    update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, (m) => m ?? new Map());
    const cachedExtensions = (await get<ExtCacheMap>(
        "cachedExtensions"
    ))!;
    const cacheInfo = cachedExtensions.get(extKey(ext));

    let downloadUrl: string;

    if (ext.source === "firefox") {
        if (cacheInfo) {
            downloadUrl = cacheInfo.url;
        } else {
            const info = await AMOAPI.getInfo(ext.id);
            downloadUrl = info.current_version.file.url;
            update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, m => m!.set(extKey(ext), {
                url: downloadUrl,
                date: new Date(),
                version: info.current_version.version,
                name: "TODO"
            }))
        }
    } else if (ext.source === "chrome") {
        downloadUrl = CWS.getProxiedDownloadURL(ext.id);
    } else if (ext.source === "url") {
        downloadUrl = ext.url;
    } else {
        throw new Error("unreachable");
    }

    const response = await fetchWithCache(downloadUrl);

    if (!response.ok) {
        return Promise.reject(
            `Failed to download extension. ${response.statusText} (${response.status})`
        );
    }

    return {
        ext,
        blob: await response.blob(),
    };
}

function extKey(id: ExtensionId): string {
    return id.source === "url"
        ? `${id.source}.${id.url}`
        : `${id.source}.${id.id}`;
}

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
    const cacheInfo = await getCacheData(ext);

    let downloadUrl: string;
    let extraInfo;

    if (ext.source === "firefox") {
        if (cacheInfo) {
            downloadUrl = cacheInfo.url;
        } else {
            const info = await AMOAPI.getInfo(ext.id);
            downloadUrl = info.current_version.file.url;
            extraInfo = {
                last_updated: info.last_updated,
                created: info.created,
            };
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

    const extension = await Extension.create(
        ext,
        await response.blob(),
        extraInfo
    );

    await storeCacheInfo(ext, {
        url: downloadUrl,
        date: new Date(),
        version: extension.details.version,
        name: extension.details.name,
    });

    return extension;
}

function extKey(id: ExtensionId): string {
    return id.source === "url"
        ? `${id.source}.${id.url}`
        : `${id.source}.${id.id}`;
}

async function getCacheData(
    id: ExtensionId
): Promise<ExtensionCacheInfo | undefined> {
    try {
        // this will fail in FF private windows
        await update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, (m) => m ?? new Map());
    } catch (e) {
        console.error(e);
        return undefined;
    }

    const cachedExtensions = (await get<ExtCacheMap>("cachedExtensions"))!;
    return cachedExtensions.get(extKey(id));
}

async function storeCacheInfo(
    id: ExtensionId,
    data: ExtensionCacheInfo
): Promise<void> {
    try {
        await update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, (m) =>
            m!.set(extKey(id), data)
        );
    } catch (e) {
        console.error(e);
    }
}

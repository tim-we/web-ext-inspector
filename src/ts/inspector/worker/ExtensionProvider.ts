import { ExtensionId } from "../../types/ExtensionId";
import Extension, { OptionalMetaData } from "./Extension";
import { update, get } from "idb-keyval";
import * as AMOAPI from "./AMO";
import * as CWS from "./CWS";

type ExtensionCacheInfo = {
    url: string;
    date: Date;
    version: string;
    name: string;
    extraInfo?: OptionalMetaData;
};

type ExtCacheMap = Map<string, ExtensionCacheInfo>;

type StatusUpdater = (status: string) => void;

const CACHED_EXTENSIONS_KEY = "cachedExtensions";

const extensionCache = (async () => {
    if (!caches) {
        // Chrome: caches is undefined in non-secure contexts
        return Promise.reject();
    }

    // Firefox: rejects with SecurityError when opening a cache in a non-secure context
    return caches.open("extensions");
})().catch(() => console.log("Extension cache not available."));

export async function getExtension(
    ext: ExtensionId,
    updateStatus: StatusUpdater
): Promise<Extension> {
    const cacheInfo = await getCacheData(ext);

    let downloadUrl = cacheInfo?.url;
    let extraInfo = cacheInfo?.extraInfo;

    if (!cacheInfo) {
        if (ext.source === "firefox") {
            const info = await AMOAPI.getInfo(ext.id);
            downloadUrl = info.current_version.file.url;
            extraInfo = {
                last_updated: info.last_updated,
                created: info.created,
                author: info.authors
                    .map((a) => a.name ?? a.username)
                    .join(", "),
            };
        } else if (ext.source === "chrome") {
            downloadUrl = CWS.getProxiedDownloadURL(ext.id);
        } else if (ext.source === "url") {
            downloadUrl = ext.url;
        }
    }

    let blob: Blob;
    const cachedResponse = await getResponseFromCache(downloadUrl!);

    if (cachedResponse) {
        blob = await cachedResponse.blob();
    } else {
        updateStatus("downloading...");
        const response = await fetch(downloadUrl!);

        if (!response.ok) {
            return Promise.reject(
                `Failed to download extension. ${response.statusText} (${response.status})`
            );
        }

        const cache = await extensionCache;
        const { quota, usage } = await navigator.storage.estimate();

        if (cache && quota! < usage!) {
            // response can only be used once
            blob = await response.clone().blob();

            if (usage! + blob.size <= quota!) {
                // response can only be used once
                cache.put(downloadUrl!, response);
            } else if (usage! > 0) {
                // TODO remove oldest entry
            }
        } else {
            blob = await response.blob();
        }
    }

    updateStatus("extracting...");

    const extension = await Extension.create(ext, blob, extraInfo);

    await storeCacheInfo(ext, {
        url: downloadUrl!,
        date: new Date(),
        version: extension.details.version,
        name: extension.details.name,
        extraInfo,
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

async function getResponseFromCache(
    url: string
): Promise<Response | undefined> {
    const cache = await extensionCache;

    if (!cache) {
        return undefined;
    }

    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
        console.info(`Loading extension from cache.`);
        return cachedResponse;
    }
}

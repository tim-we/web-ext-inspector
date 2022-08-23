import { ExtensionId } from "../../types/ExtensionId";
import Extension from "./Extension";
import * as AMOAPI from "./AMO";
import * as CWS from "./CWS";
import {
    getExtensionCache,
    getCacheData,
    storeCacheInfo,
} from "../CacheHelper";

type StatusUpdater = (status: string) => void;

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

    let blob: Blob | null = null;
    const cachedResponse = await getResponseFromCache(downloadUrl!);

    if (cachedResponse) {
        blob = await cachedResponse.blob();

        if (cacheInfo) {
            const age = Date.now() - cacheInfo.date.valueOf();
            const aDay = 1000 * 60 * 60 * 24;
            if (age > aDay) {
                // TODO check for new version
            }
        }
    } else {
        updateStatus("downloading...");
        const response = await fetch(downloadUrl!);

        if (!response.ok) {
            return Promise.reject(
                `Failed to download extension. ${response.statusText} (${response.status})`
            );
        }

        // navigator.storage is only available in secure contexts
        if (navigator.storage) {
            const cache = await getExtensionCache();
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
            }
        }

        if (!blob) {
            blob = await response.blob();
        }
    }

    updateStatus("extracting...");

    const extension = await Extension.create(ext, blob, extraInfo);

    if (ext.source !== "url") {
        // TODO
        await storeCacheInfo(ext, {
            id: ext,
            url: downloadUrl!,
            date: new Date(),
            version: extension.details.version,
            name: extension.details.name,
            extraInfo,
        });
    }

    return extension;
}

async function getResponseFromCache(
    url: string
): Promise<Response | undefined> {
    const cache = await getExtensionCache();

    if (!cache) {
        return undefined;
    }

    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
        console.info(`Loading extension from cache.`);
        return cachedResponse;
    }
}

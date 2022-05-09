import { update, get } from "idb-keyval";
import { ExtCacheMap, ExtensionCacheInfo } from "../types/ExtensionCache";

const CACHED_EXTENSIONS_KEY = "cachedExtensions";

const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

const extensionCache = (async () => {
    if (!caches) {
        // Chrome: caches is undefined in non-secure contexts
        return Promise.reject();
    }

    // Firefox: rejects with SecurityError when opening a cache in a non-secure context
    return caches.open("extensions");
})().catch(() => console.log("Extension cache not available."));

export async function removeOld() {
    const cache = await extensionCache;
    const deletions: Promise<unknown>[] = [];

    try {
        await update<ExtCacheMap>(CACHED_EXTENSIONS_KEY, (m) => {
            if (!m) {
                return new Map();
            }

            for (const [k, v] of m.entries()) {
                const old = Date.now() - v.date.valueOf() > CACHE_MAX_AGE;

                if (old) {
                    m.delete(k);

                    if (cache) {
                        deletions.push(cache.delete(v.url));
                    }
                }
            }

            return m;
        });
    } catch (e) {
        console.error(e);
    }

    await Promise.all(deletions);
}

export async function getRecent(): Promise<ExtensionCacheInfo[]> {
    const cachedExtensions = await get<ExtCacheMap>(CACHED_EXTENSIONS_KEY)
        .catch(() => new Map() as ExtCacheMap)
        .then((m) => (m ? Array.from(m.values()) : []));

    cachedExtensions.sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return cachedExtensions;
}

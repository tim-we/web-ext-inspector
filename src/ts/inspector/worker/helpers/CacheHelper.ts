const NO_CACHE_INFO = "Extension cache not available.";

export async function fetchWithCache(url: string, cacheName: string): Promise<Response> {
    if (!caches) {
        // Chrome: caches is undefined in non-secure contexts
        console.info(NO_CACHE_INFO);
        return fetch(url);
    }

    const cache = await caches.open(cacheName).catch(() => undefined);

    if (!cache) {
        // Firefox: rejects with SecurityError when opening a cache in a non-secure context
        console.info(NO_CACHE_INFO);
        return fetch(url);
    }

    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
        console.info(`serving ${url} from cache`);
        return cachedResponse;
    }

    const response = await fetch(url);

    if (response.ok) {
        const { quota, usage } = await navigator.storage.estimate();
        const size = Number(response.headers.get("content-length"));

        if(usage! + size < quota!) {
            cache.put(url, response.clone());
        } else if(usage! > 0) {
            // TODO remove oldest entry
        }
        
    }

    return response;
}

// TODO:
// - display recently inspected extensions on start screen
// - remove old versions from cache
// - check for new versions (automatically & manually)
// - use idb-keyval to manage cached files
// - cache local files?
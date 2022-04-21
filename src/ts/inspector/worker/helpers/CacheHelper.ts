const NO_CACHE_INFO = "Extension cache not available.";

export async function fetchWithCache(url: string): Promise<Response> {
    if (!caches) {
        // Chrome: caches is undefined in non-secure contexts
        console.info(NO_CACHE_INFO);
        return fetch(url);
    }

    const cache = await caches.open("extensions").catch(() => undefined);

    if (!cache) {
        // Firefox: throws SecurityError when opening a cache in a non-secure context
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
        cache.put(url, response.clone());
    }

    return response;
}

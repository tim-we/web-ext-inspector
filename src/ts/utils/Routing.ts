import { route } from "preact-router";

export function customRoute(path: string, replace: boolean = false): void {
    const location = window.location;

    if (!location.host.endsWith("github.io")) {
        route(path, replace);
        return;
    }

    const base = location.pathname.split("/").filter((s) => s.length > 0)[0];

    route("/" + base + path);
}

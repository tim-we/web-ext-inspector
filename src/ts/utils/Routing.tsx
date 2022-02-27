import { FunctionalComponent } from "preact";
import { route } from "preact-router";

const github = window.location.host.endsWith("github.io");
const base = github
    ? window.location.pathname.split("/").filter((s) => s.length > 0)[0]
    : "";

export function customRoute(path: string, replace: boolean = false): void {
    route("/" + base + path, replace);
}

export const AppLink: FunctionalComponent<{ href: string }> = (props) => (
    <a href={base + props.href}>{props.children}</a>
);

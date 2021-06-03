import { Component } from "preact";
import { Inspector } from "../inspector/Inspector";
import { Manifest } from "../types/Manifest";
import UIBox from "./UIBox";

type Props = {
    inspector: Inspector;
};

type State = {
    manifest?: Manifest;
};

export default class ExtensionPermissions extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {};
        props.inspector
            .getManifest()
            .then((manifest) => this.setState({ manifest }));
    }

    public render() {
        if (this.state.manifest === undefined) {
            return null;
        }

        const allPermissions = this.state.manifest.permissions ?? [];
        const apiPermissions = allPermissions.filter((p) =>
            API_PERMISSIONS.has(p)
        );
        const hostPermissions = allPermissions.filter(
            (p) => !API_PERMISSIONS.has(p)
        );

        return (
            <UIBox key="permissions" title="Permissions">
                {apiPermissions.length > 0 ? (
                    <div class="permission-list">
                        {apiPermissions.map((p) => (
                            <Permission
                                type="api"
                                permission={p}
                                optional={false}
                            />
                        ))}
                    </div>
                ) : null}
                {hostPermissions.length > 0 ? (
                    <div class="permission-list">
                        {hostPermissions.map((p) => (
                            <Permission
                                type="host"
                                permission={p}
                                optional={false}
                            />
                        ))}
                    </div>
                ) : null}
            </UIBox>
        );
    }
}

const API_PERMISSIONS = new Set([
    "activeTab",
    "alarms",
    "background",
    "bookmarks",
    "browserSettings",
    "browsingData",
    "captivePortal",
    "clipboardRead",
    "clipboardWrite",
    "contentSettings",
    "contextMenus",
    "contextualIdentities",
    "cookies",
    "debugger",
    "dns",
    "downloads",
    "downloads.open",
    "find",
    "geolocation",
    "history",
    "identity",
    "idle",
    "management",
    "menus",
    "menus.overrideContext",
    "nativeMessaging",
    "notifications",
    "pageCapture",
    "pkcs11",
    "privacy",
    "proxy",
    "search",
    "sessions",
    "storage",
    "tabHide",
    "tabs",
    "theme",
    "topSites",
    "unlimitedStorage",
    "webNavigation",
    "webRequest",
    "webRequestBlocking",
]);

type PermissionProps = {
    permission: string;
    optional: boolean;
    type: "api" | "host";
};

const Permission = (props: PermissionProps) => (
    <div
        class={`permission ${props.type} ${props.optional ? "optional" : ""}`}
        title={`${props.type} permission`}
    >
        {props.permission}
    </div>
);

import { Component, FunctionalComponent as FC } from "preact";
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
        const manifest = this.state.manifest;
        if (manifest === undefined) {
            return null;
        }

        const requiredPermissions = manifest.permissions ?? [];
        const optionalPermissions = manifest.optional_permissions ?? [];

        requiredPermissions.sort();
        optionalPermissions.sort();

        return (
            <UIBox
                key="permissions"
                title="Permissions"
                classes={["permissions"]}
            >
                <PermissionList required={true}>
                    {requiredPermissions.map((p) => (
                        <Permission permission={p} />
                    ))}
                </PermissionList>
                <PermissionList required={false}>
                    {optionalPermissions.map((p) => (
                        <Permission permission={p} />
                    ))}
                </PermissionList>
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

type PLProps = {
    required: boolean;
};

const PermissionList: FC<PLProps> = (props) => {
    if (props.children == false) {
        return null;
    }

    return (
        <div class="permission-list">
            <div class="pl-title">
                {props.required
                    ? "Required Permissions"
                    : "Optional Permissions"}
            </div>
            {props.children}
        </div>
    );
};

type PermissionProps = {
    permission: string;
};

const Permission = (props: PermissionProps) => {
    const type = API_PERMISSIONS.has(props.permission) ? "api" : "host";

    return (
        <div class={`permission ${type}`} title={`${type} permission`}>
            {props.permission}
        </div>
    );
};

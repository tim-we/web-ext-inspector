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

const mdnBaseURL =
    "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions";

const apiPermissions: Map<string, string | null> = new Map([
    [
        "activeTab",
        mdnBaseURL + "/manifest.json/permissions#activetab_permission",
    ],
    ["alarms", null],
    ["background", null],
    ["bookmarks", null],
    ["browserSettings", null],
    ["browsingData", null],
    ["captivePortal", null],
    [
        "clipboardRead",
        mdnBaseURL + "/manifest.json/permissions#clipboard_access",
    ],
    [
        "clipboardWrite",
        mdnBaseURL + "/manifest.json/permissions#clipboard_access",
    ],
    ["contentSettings", null],
    ["contextMenus", null],
    ["contextualIdentities", null],
    ["cookies", null],
    ["debugger", null],
    ["dns", null],
    ["downloads", null],
    ["downloads.open", null],
    ["find", null],
    ["geolocation", null],
    ["history", null],
    ["identity", null],
    ["idle", null],
    ["management", null],
    ["menus", null],
    ["menus.overrideContext", null],
    ["nativeMessaging", null],
    ["notifications", null],
    ["pageCapture", null],
    ["pkcs11", null],
    ["privacy", null],
    ["proxy", null],
    ["search", null],
    ["sessions", null],
    ["storage", null],
    ["tabHide", mdnBaseURL + "/API/tabs/hide"],
    ["tabs", null],
    ["theme", null],
    ["topSites", null],
    [
        "unlimitedStorage",
        mdnBaseURL + "/manifest.json/permissions#unlimited_storage",
    ],
    ["webNavigation", null],
    ["webRequest", null],
    ["webRequestBlocking", null],
]);

const hostPermissionsInfo =
    mdnBaseURL + "/manifest.json/permissions#host_permissions";

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
    const type = apiPermissions.has(props.permission) ? "api" : "host";

    let infoURL = hostPermissionsInfo;
    
    if(type === "api") {
        const url = apiPermissions.get(props.permission);

        infoURL = url ? url : mdnBaseURL + "/API/" + props.permission;
    }

    const classes = ["permission", type];

    return (
        <a
            class={classes.join(" ")}
            href={infoURL ?? undefined}
            target="_blank"
        >
            {props.permission}
        </a>
    );
};

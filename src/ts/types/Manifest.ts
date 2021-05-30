export type Manifest = Manifest2;

type Manifest2 = {
    manifest_version: 2;
    name: string;
    version: string;

    background?: {
        page: string;
        scripts: string[];
        persistent?: boolean;
    };

    content_scripts?: ContentScript[];
    user_scripts?: {
        api_script?: string;
    };

    optional_permissions?: Permission[];
    permissions?: Permission[];

    commands?: {
        [commandName: string]: Command;
    };

    web_accessible_resources?: string[];
    content_security_policy?: string;

    // TODO
    browser_action?: any;
    page_action?: any;
    sidebar_action?: any;
    protocol_handlers?: any[];
};

type Permission = string;

type Command = {
    suggested_key?: {
        default?: string;
        mac?: string;
        linux?: string;
        windows?: string;
        chromeos?: string;
        android?: string;
        ios?: string;
    };
    description?: string;
};

type ContentScript = {
    matches: string[];
    exclude_matches?: string[];
    include_globs?: string[];
    exclude_globs?: string[];
    css?: string[];
    js?: string[];
    all_frames?: boolean;
    match_about_blank?: boolean;
    run_at?: "document_start" | "document_end" | "document_idle";
};

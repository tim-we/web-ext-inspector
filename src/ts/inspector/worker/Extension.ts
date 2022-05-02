import { ExtensionId } from "../../types/ExtensionId";
import AsyncEvent from "../../utils/AsyncEvent";
import { createFileTree, TreeFile, TreeFolder, TreeNode } from "./FileTree";
import * as zip from "@zip.js/zip.js";
import { Manifest } from "../../types/Manifest";
import { ExtensionDetails } from "../../types/ExtensionDetails";
import * as ScriptFinder from "./helpers/ScriptFinder";
import * as ResourceLocator from "./helpers/ResourceLocator";
import { Translations } from "../../types/Translations";

export type OptionalMetaData = Partial<{
    last_updated: string;
    created: string;
    author: string;
}>;

export default class Extension {
    readonly id: ExtensionId;
    manifest: Manifest;
    details: ExtensionDetails;

    private readonly initialized = new AsyncEvent("extension initialized");
    rootDir: TreeFolder; // TODO consider making this private
    private defaultTranslations: Translations | null = null;

    private constructor(
        id: ExtensionId,
        zipData: Blob,
        extraInfo: OptionalMetaData
    ) {
        this.id = id;
        const zipReader = new zip.ZipReader(new zip.BlobReader(zipData));

        (async () => {
            // load files & directory structure
            this.rootDir = createFileTree(await zipReader.getEntries());

            // load manifest
            const manifestNode = this.rootDir.get("manifest.json");
            if (!(manifestNode instanceof TreeFile)) {
                throw new Error("Could not find manifest.json.");
            }
            manifestNode.addTag("manifest");
            // TODO: manifest.json may contain single line comments (//)
            this.manifest = JSON.parse(await manifestNode.getTextContent());
            if (this.manifest.manifest_version !== 2) {
                console.error(
                    `Unsupported manifest version ${this.manifest.manifest_version}.`
                );
                // TODO: add manifest v3 (currently Chrome-only) support
            }

            // translations
            if (this.manifest.default_locale !== undefined) {
                const messagesFile = this.rootDir.get(
                    "_locales/" +
                        this.manifest.default_locale +
                        "/messages.json"
                );
                if (messagesFile instanceof TreeFile) {
                    this.defaultTranslations = JSON.parse(
                        await messagesFile.getTextContent()
                    );
                }
            }

            await zipReader.close();

            await this.createDetails(extraInfo);
            await this.findScriptsAndResources();

            this.initialized.fire();
        })();
    }

    public static async create(
        id: ExtensionId,
        zipData: Blob,
        extraInfo: OptionalMetaData = {}
    ): Promise<Extension> {
        const extension = new Extension(id, zipData, extraInfo);
        await extension.initialized.waitFor();
        return extension;
    }

    public async getFileDownloadURL(
        path: string,
        timeout: number = 10.0
    ): Promise<string> {
        if (!this.rootDir) {
            await this.initialized.waitFor();
        }

        const fileNode = this.rootDir.get(path);

        if (!(fileNode instanceof TreeFile)) {
            throw new Error(`"${path}" is not a file.`);
        }

        let blob: Blob = await fileNode.entry.getData!(new zip.BlobWriter());
        if (path.endsWith(".svg")) {
            blob = blob.slice(0, blob.size, "image/svg+xml");
        }

        const url = URL.createObjectURL(blob);

        if (timeout > 0.0) {
            setTimeout(() => URL.revokeObjectURL(url), timeout * 1000);
        }

        return url;
    }

    public async getFileOrFolder(path: string): Promise<TreeNode> {
        await this.initialized.waitFor();

        const node = this.rootDir.get(path);

        if (!node) {
            throw new Error(`No such file or folder: ${path}`);
        }

        return node;
    }

    private async createDetails(extraInfo: OptionalMetaData): Promise<void> {
        const manifest = this.manifest;

        let iconUrl: string | undefined = undefined;

        if (manifest.icons) {
            const sizes = Object.keys(manifest.icons).map((s) =>
                parseInt(s, 10)
            );
            // sort sizes descending
            sizes.sort((a, b) => b - a);

            if (sizes.length > 0) {
                const optimalSizes = sizes.filter((s) => s >= 48 && s <= 96);
                const size =
                    optimalSizes.length > 0 ? optimalSizes[0] : sizes[0];
                iconUrl = await this.getFileDownloadURL(
                    manifest.icons["" + size]
                );
            }
        }

        this.details = {
            name: this.translate(manifest.name),
            version: manifest.version,
            size: this.rootDir.byteSize,
            icon_url: iconUrl,
            author: manifest.author ?? extraInfo.author,
            last_updated: extraInfo.last_updated,
            created: extraInfo.created,
        };
    }

    private async findScriptsAndResources(): Promise<void> {
        const root = this.rootDir;
        const manifest = this.manifest;

        await ScriptFinder.identifyBackgroundScripts(root, manifest);

        ScriptFinder.identifyContentScripts(root, manifest);
        ScriptFinder.identifySidebarScripts(root, manifest);
        ScriptFinder.identifyUserScriptAPI(root, manifest);
        ScriptFinder.identifyActionScripts(root, manifest);

        ResourceLocator.identifyWebAccessibleResources(root, manifest);
    }

    private translate(rawString: string): string {
        if (this.defaultTranslations === null) {
            return rawString;
        }

        const matches = rawString.match(/^__MSG_(.+)__$/);

        if (matches === null || matches.length !== 2) {
            return rawString;
        }

        const messageName = matches[1];
        const translation = this.defaultTranslations[messageName];

        if (translation) {
            return translation.message;
        }

        return rawString;
    }
}

import { ExtensionId } from "../../types/ExtensionId";
import AsyncEvent from "../../utils/AsyncEvent";
import { createFileTree, TreeFile, TreeFolder } from "./FileTree";
import * as zip from "@zip.js/zip.js";
import { Manifest } from "../../types/Manifest";
import { ExtensionDetails } from "../../types/ExtensionDetails";
import * as ScriptFinder from "./helpers/ScriptFinder";
import * as ResourceLocator from "./helpers/ResourceLocator";
import { Translations } from "../../types/Translations";

export default class Extension {
    id: ExtensionId;
    rootDir: TreeFolder;
    manifest: Manifest;
    details: ExtensionDetails;

    private initialized = new AsyncEvent("extension initialized");
    private defaultTranslations: Translations | null = null;

    public constructor(id: ExtensionId, zipData: Blob) {
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
            if(this.manifest.manifest_version !== 2) {
                console.error(`Unsupported manifest version ${this.manifest.manifest_version}.`);
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

            this.createDetails();
            this.findScriptsAndResources();

            this.initialized.fire();
        })();
    }

    public async getFileDownloadURL(
        path: string,
        timeout: number = 10.0
    ): Promise<string> {
        await this.initialized.waitFor();
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

    private async createDetails(): Promise<void> {
        const manifest = this.manifest;

        let iconUrl: string | undefined = undefined;

        if (manifest.icons && manifest.icons["48"]) {
            iconUrl = await this.getFileDownloadURL(manifest.icons["48"]);
        }

        this.details = {
            name: this.translate(manifest.name),
            version: manifest.version,
            size: this.rootDir.byteSize,
            icon_url: iconUrl,
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

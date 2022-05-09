import { ExtensionId } from "./ExtensionId";

export type OptionalMetaData = Partial<{
    last_updated: string;
    created: string;
    author: string;
}>;

export type ExtensionCacheInfo = {
    id: ExtensionId;
    url: string;
    date: Date;
    version: string;
    name: string;
    extraInfo?: OptionalMetaData;
};

export type ExtCacheMap = Map<string, ExtensionCacheInfo>;

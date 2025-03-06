import { type Remote, releaseProxy } from "comlink";
import type { TranslationsInfo } from "../extension/Extension";
import type Extension from "../extension/Extension";
import type { ExtensionSource } from "../extension/sources/ExtensionSource";
import type { ExtensionSummary } from "../extension/types/ExtensionSummary";
import type { Session } from "./Session";

export default class SessionProxy {
  readonly id: Session["id"];
  readonly summary: Readonly<ExtensionSummary>;

  readonly #source: Readonly<ExtensionSource>;
  readonly #remoteSession: Readonly<Remote<Session>>;
  readonly #remoteExtension: Readonly<Remote<Extension>>;

  private constructor(
    id: Session["id"],
    source: ExtensionSource,
    remote: Remote<Session>,
    extension: Remote<Extension>,
    summary: ExtensionSummary
  ) {
    this.id = id;
    this.#remoteSession = remote;
    this.#remoteExtension = extension;
    this.#source = source;
    this.summary = summary;
  }

  static async create(source: ExtensionSource, session: Remote<Session>): Promise<SessionProxy> {
    const id = await session.id;
    const summary = await session.getSummary();
    const extension = await session.getExtension();

    return new SessionProxy(id, source, session, extension, summary);
  }

  getTranslations(locale: string): Promise<TranslationsInfo | undefined> {
    return this.#remoteSession.getTranslations(locale);
  }

  getPermissions() {
    return this.#remoteExtension.getPermissions();
  }

  getDirectoryContents(path: string) {
    return this.#remoteSession.getDirectoryContents(path);
  }

  changeFileSystemCursor(selectedPath: string, key: KeyboardEvent["key"]) {
    return this.#remoteSession.changeFileSystemCursor(selectedPath, key);
  }

  getPrettyCode(path: string) {
    return this.#remoteSession.getPrettyCode(path);
  }

  getFileDownloadUrl(path: string): Promise<string> {
    return this.#remoteExtension.getFileURL(path);
  }

  async dispose() {
    this.#remoteSession.free();
    this.#remoteSession[releaseProxy]();
    this.#remoteExtension[releaseProxy]();
  }
}

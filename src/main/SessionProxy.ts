import { type Remote, releaseProxy } from "comlink";
import type { ExtensionSource } from "../extension/sources/ExtensionSource";
import type { ExtensionSummary } from "../extension/types/ExtensionSummary";
import type { Session } from "./Session";
import type { TranslationsInfo } from "../extension/Extension";

export default class SessionProxy {
  readonly id: Session["id"];
  readonly summary: Readonly<ExtensionSummary>;

  readonly #source: Readonly<ExtensionSource>;
  readonly #remote: Readonly<Remote<Session>>;

  private constructor(
    id: Session["id"],
    source: ExtensionSource,
    remote: Remote<Session>,
    summary: ExtensionSummary
  ) {
    this.id = id;
    this.#remote = remote;
    this.#source = source;
    this.summary = summary;
  }

  static async create(source: ExtensionSource, session: Remote<Session>): Promise<SessionProxy> {
    const id = await session.id;
    const summary = await session.getSummary();

    return new SessionProxy(id, source, session, summary);
  }

  getTranslations(locale: string): Promise<TranslationsInfo | undefined> {
    return this.#remote.getTranslations(locale);
  }

  async dispose() {
    this.#remote.free();
    this.#remote[releaseProxy]();
  }
}

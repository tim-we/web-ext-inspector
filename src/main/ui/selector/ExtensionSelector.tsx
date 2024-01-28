import type { FunctionComponent } from "preact";
import { useId, useRef, useState } from "preact/hooks";

import "../main-section.scss";
import "./selector.scss";

type ExtensionSourceId = "amo" | "cws" | "file";

type Props = {
  closable: boolean;
};

const ExtensionSelector: FunctionComponent<Props> = ({ closable }) => {
  const [source, setSource] = useState<ExtensionSourceId>("amo");
  const [extensionId, setExtensionId] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const selectSourceId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // TODO
  };

  const storeLink = {
    amo: "https://addons.mozilla.org",
    cws: "https://chrome.google.com/webstore",
    file: undefined
  }[source];

  return (
    <article class="main-section extension-selection">
      <h2>Select extension</h2>
      <div class="buttons">
        {closable ? <button type="button" class="close" title="close" /> : null}
      </div>
      <form class="content" onSubmit={handleSubmit}>
        <div class="row">
          <label for={selectSourceId}>Source</label>
          <select
            id={selectSourceId}
            value={source}
            onChange={(e) => setSource((e.target as HTMLSelectElement).value as ExtensionSourceId)}
          >
            <option value="amo">Firefox Browser Add-ons</option>
            <option value="cws" disabled={!__DEBUG__}>
              Chrome Web Store
            </option>
            <option value="file">Local file</option>
          </select>

          <a
            target="_blank"
            class="browse external"
            href={storeLink}
            title="Browse extension store"
            rel="noreferrer"
          >
            Browse
          </a>
        </div>
        {source !== "file" ? (
          <>
            <div class="row">
              <span class="url">
                {source === "amo"
                  ? "addons.mozilla.org/en-US/firefox/addon/"
                  : "chrome.google.com/webstore/detail/*/"}
              </span>
              <input
                type="text"
                value={extensionId}
                placeholder="extension id"
                aria-label="extension id"
                title="extension id"
                onInput={(e) => setExtensionId((e.target as HTMLInputElement).value)}
                required
              />
            </div>
          </>
        ) : null}
        {source === "file" ? (
          <div class="row">
            <input
              type="file"
              accept=".zip,.xpi,.crx"
              ref={fileInputRef}
              onChange={(e) => setFile((e.target as HTMLInputElement).files![0])}
              required
            />
          </div>
        ) : null}
        <div class="row">
          <button
            type="submit"
            class="action with-icon"
            disabled={!canSubmit(source, extensionId, fileInputRef.current)}
          >
            Inspect
          </button>
        </div>
      </form>
    </article>
  );
};

export default ExtensionSelector;

function canSubmit(
  source: ExtensionSourceId,
  extensionId: string,
  fileInput: HTMLInputElement | null
): boolean {
  if (source === "file") {
    console.log("num files", fileInput?.files?.length ?? 0);
    return fileInput?.files?.length === 1;
  }
  if (source === "cws") {
    return false;
  }
  if (source === "amo") {
    return extensionId.trim().length > 0;
  }
  return false;
}

import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import Tile from "./Tile";
import TranslationsViewer from "../popups/TranslationsViewer";

const TranslationsTile: FunctionComponent<ExtensionData["translations"]> = (meta) => {
  const { locales, messages, defaultLocale, percentage } = meta;

  return (
    <Tile title="Translations" cssClass="translations" popup={(id) => createPopupOptions(id, meta)}>
      {locales.length === 0 ? (
        <span>no translations</span>
      ) : (
        <table>
          <tbody>
            <tr>
              <td class="count">{locales.length}</td>
              <td>Locales</td>
            </tr>
            <tr>
              <td class="count">{messages}</td>
              <td>Strings</td>
            </tr>
            <tr>
              <td title="Default locale">{defaultLocale ?? "-"}</td>
              <td>Default</td>
            </tr>
            {percentage !== undefined ? (
              <tr>
                <td class="count">{Math.round(100 * percentage)}%</td>
                <td>translated</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </Tile>
  );
};

export default TranslationsTile;

function createPopupOptions(id: ExtensionData["id"], data: ExtensionData["translations"]) {
  return {
    title: "Translations",
    content: <TranslationsViewer extId={id} meta={data} />
  };
}

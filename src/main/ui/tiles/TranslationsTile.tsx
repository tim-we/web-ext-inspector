import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import Tile from "./Tile";

const TranslationsTile: FunctionComponent<ExtensionData["translations"]> = ({
  locales,
  messages,
  defaultLocale
}) => (
  <Tile title="Translations" cssClass="translations" popup={createPopupOptions}>
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
        </tbody>
      </table>
    )}
  </Tile>
);

export default TranslationsTile;

function createPopupOptions() {
  return {
    title: "Translations",
    content: "Not yet implemented."
  };
}

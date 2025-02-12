import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import DonutChart from "../common/DonutChart";
import type { PopupWindowOptions } from "../popups/PopupWindow";
import TranslationsViewer from "../translations/TranslationsViewer";
import Tile from "./Tile";

import "./translations-tile.css";

const TranslationsTile: FunctionComponent<ExtensionData["translations"]> = (meta) => {
  const { locales, messages, defaultLocale, percentage } = meta;
  const donutData =
    percentage === undefined
      ? []
      : [
          { amount: percentage, color: `hsl(${Math.round(10 + 65 * percentage)} 90% 48%)` },
          { amount: 1 - percentage, color: "rgb(128, 128, 128)" }
        ];

  function createPopupOptions(id: ExtensionData["id"]): PopupWindowOptions {
    return {
      title: "Translations",
      content: <TranslationsViewer extId={id} meta={meta} />,
      initialWidth: 1280,
      initialHeight: 720
    };
  }

  return (
    <Tile
      title="Translations"
      cssClass="translations"
      popup={locales.length > 0 ? createPopupOptions : undefined}
    >
      {locales.length === 0 ? (
        <span class="none">no translations</span>
      ) : (
        <div>
          {percentage === 1 ? <span class="full" /> : <DonutChart data={donutData} />}
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
                  <td class="count">{Math.floor(100 * percentage)}%</td>
                  <td>translated</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </Tile>
  );
};

export default TranslationsTile;

import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import { useState, useEffect, useRef } from "preact/hooks";
import wrappedWorker from "../../MainWorkerRef";
import type { TranslationsInfo } from "../../../extension/Extension";

import "./translations.css";

type ViewerProps = { extId: ExtensionId; meta: ExtensionData["translations"] };

const TranslationsViewer: FunctionComponent<ViewerProps> = ({ extId, meta }) => {
  const [selectedLocales, setSelectedLocales] = useState<Set<string>>(new Set());
  const [loadedLocales, setLoadedLocales] = useState<Map<string, TranslationsInfo>>(new Map());
  const selectRef = useRef<HTMLSelectElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const defaultLocale = loadedLocales.get(meta.defaultLocale!);
  const allKeys = defaultLocale
    ? [...Object.keys(defaultLocale.messages), ...defaultLocale.missingKeys]
    : [];
  const remainingLocales = Array.from(new Set(meta.locales).difference(new Set(selectedLocales)));

  // Set initially selected locales.
  useEffect(() => {
    const initialLocales = new Set(navigator.languages).intersection(new Set(meta.locales));
    initialLocales.add(meta.defaultLocale!);
    setSelectedLocales(initialLocales);
  }, [meta.locales, meta.defaultLocale]);

  // Load missing locales.
  useEffect(() => {
    if (selectedLocales.difference(loadedLocales).size === 0) {
      return;
    }

    const notLoadedLocales = Array.from(selectedLocales.difference(new Set(loadedLocales.keys())));
    const copiedMap = new Map(loadedLocales);

    Promise.all(
      notLoadedLocales.map((locale) => wrappedWorker.getTranslations(extId, locale))
    ).then((results) => {
      for (const result of results) {
        if (result) {
          copiedMap.set(result.locale, result);
        }
      }
      setLoadedLocales(copiedMap);
    });
  }, [extId, selectedLocales, loadedLocales]);

  function localeLabel(locale: string, hidePercentage = false): string {
    const label = intlLocaleDisplayNames.of(locale) ?? locale;
    const data = loadedLocales.get(locale);
    if (!hidePercentage && data && data.percentage < 1) {
      return `${label} (${Math.floor(100 * data.percentage)}%)`;
    }
    return label;
  }

  function addLocale() {
    if (selectRef.current) {
      setSelectedLocales(new Set([...selectedLocales, selectRef.current.value]));
    }
  }

  function removeLocale(locale: string) {
    const copy = new Set(selectedLocales);
    copy.delete(locale);
    setSelectedLocales(copy);
  }

  return (
    <div class="translations-viewer">
      <table class="translations">
        <thead>
          <tr>
            <th>Key</th>
            {Array.from(selectedLocales).map((locale) => (
              <th key={locale}>
                <div>
                  <span title={locale}>{localeLabel(locale)}</span>
                  {selectedLocales.size > 1 ? (
                    <button type="button" title="remove" onClick={() => removeLocale(locale)} />
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allKeys.map((key) => (
            <tr key={key}>
              <td title={key}>{key}</td>
              {Array.from(selectedLocales).map((locale) => {
                const translations = loadedLocales.get(locale);

                if (!translations) {
                  return <td key={`${key}:${locale}`}>...</td>;
                }

                if (!Object.hasOwn(translations.messages, key)) {
                  return (
                    <td
                      key={`${key}:${locale}`}
                      class="missing"
                      title={`${localeLabel(locale, true)} translation missing`}
                    >
                      -
                    </td>
                  );
                }

                const translation = translations.messages[key];
                const message =
                  translation.message.length > 120
                    ? `${translation.message.substring(0, 100)}...`
                    : translation.message;

                return (
                  <td key={`${key}:${locale}`} title={translation.description}>
                    {message}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot />
      </table>
      {remainingLocales.length > 0 ? (
        <div class="locale-selector">
          <div>
            <select ref={selectRef}>
              {remainingLocales.map((locale) => (
                <option key={locale} value={locale} title={locale}>
                  {`${locale} - ${localeLabel(locale)}`}
                </option>
              ))}
            </select>
            <button type="button" class="action with-icon" ref={buttonRef} onClick={addLocale}>
              Add
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const intlLocaleDisplayNames = new Intl.DisplayNames([navigator.language], { type: "language" });

export default TranslationsViewer;

type ExtensionId = ExtensionData["id"];

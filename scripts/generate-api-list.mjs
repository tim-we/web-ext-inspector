import fs from "node:fs";
import path from "node:path";
import bcd from "@mdn/browser-compat-data" assert { type: "json" };
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import { globSync } from "glob";
import { decode as htmlDecode } from "html-entities";
import stringify from "json-stable-stringify";
import stripJsonComments from "strip-json-comments";

// Chrome: https://github.com/cvsuser-chromium/chromium/tree/master/chrome/common/extensions/api

const tag = "FIREFOX_122_0_RELEASE";
const schemaURLs = ["browser", "toolkit"].map(
  (x) =>
    `https://hg.mozilla.org/mozilla-unified/archive/${tag}.zip/${x}/components/extensions/schemas/`
);
const schemaDir = path.join("schemas", tag);
const outputFile = path.join("data", "api.json");
const outputCompactFile = path.join("data", "api-compact.json");

// Download schemas
if (fs.mkdirSync(schemaDir, { recursive: true }) !== undefined) {
  const files = new Set();

  for (const url of schemaURLs) {
    console.log(`Downloading ${url}`);

    const response = await fetch(url);
    const blob = await response.blob();

    console.log("Unzipping...");
    const zipReader = new ZipReader(new BlobReader(blob));

    for await (const entry of zipReader.getEntriesGenerator()) {
      if (entry.directory || !entry.filename.endsWith(".json")) {
        continue;
      }
      const filename = path.basename(entry.filename);
      if (files.has(filename)) {
        console.warn(`Duplicate file: ${filename}`);
        continue;
      }

      const content = await entry.getData(new TextWriter());

      fs.writeFileSync(path.join(schemaDir, filename), content, "utf-8");
      files.add(filename);
    }

    zipReader.close();
  }
  console.log(`Created ${files.size} json files in ${schemaDir}.`);
} else {
  console.log(`Skipping schema download because directory "${schemaDir}" already exists.`);
}

// Collect API info
const jsonFiles = globSync(path.join(schemaDir, "*.json"));
const apiInfos = {};

for (const file of jsonFiles) {
  console.log(`Loading ${file}`);
  const raw = fs.readFileSync(file, "utf-8");
  const json = JSON.parse(stripJsonComments(raw));

  if (!Array.isArray(json)) {
    console.warn(`Unexpected JSON in ${file}`);
    continue;
  }

  for (const namespace of json) {
    const nsName = namespace.namespace;
    const nsPermissions = namespace.permissions ?? [];
    const nsCompat = bcd.webextensions.api[nsName];

    const apiStuff = [
      ...(namespace.functions ?? []).map((f) => ({ ...f, kind: "function" })),
      ...(namespace.events ?? []).map((e) => ({ ...e, kind: "event" }))
    ];

    for (const apiFunc of apiStuff) {
      if (apiFunc.type !== "function") {
        console.warn(`Skipping ${nsName}.${apiFunc.name}.`);
        continue;
      }

      const permissions = getPermissions(nsPermissions, apiFunc);

      const compat = nsCompat === undefined ? undefined : nsCompat[apiFunc.name]?.__compat;

      apiInfos[`${nsName}.${apiFunc.name}`] = {
        type: apiFunc.kind,
        permissions,
        mdn: compat?.mdn_url?.replace(
          /^https:\/\/developer\.mozilla\.org\/docs\/Mozilla\/Add-ons\/WebExtensions\/API\//,
          "API:"
        ),
        description: cleanDescription(apiFunc.description),
        parameters: apiFunc.parameters?.map((p) => p.name ?? "_"),
        chrome: isSupported(compat?.support.chrome),
        firefox: isSupported(compat?.support.firefox)
      };
    }
  }
}

const compactInfos = {
  functions: Object.entries(apiInfos)
    .filter(([k, v]) => v.type === "function")
    .map(([k, v]) => k),
  events: Object.entries(apiInfos)
    .filter(([k, v]) => v.type === "event")
    .map(([k, v]) => k)
};

// Output
console.log(`Found ${Object.keys(apiInfos).length} API functions.`);
fs.writeFileSync(outputFile, stringify(apiInfos), "utf-8");
console.log(`Results written to ${outputFile}.`);
fs.writeFileSync(outputCompactFile, stringify(compactInfos));

/**
 * @param {string|undefined} description
 * @returns {string|undefined}
 */
function cleanDescription(description) {
  if (description === undefined) {
    return undefined;
  }

  if (description === "...") {
    return undefined;
  }

  // Replace
  // $(topic:current-window)[current window]
  // with
  // current window
  const withoutLinks = description.replace(/\$\(.+\)\[(.+?)\]/g, (_, p1) => p1);

  // Fix things like $(ref:userScripts.UserScriptOptions)
  const withoutReferences = withoutLinks.replace(/\$\(ref:(.+?)\)/g, (_, p1) => p1);

  // Decode html entities like $nbsp;
  return htmlDecode(withoutReferences);
}

/**
 * @param {{version_added: string|boolean; version_removed?: string;} | undefined} compatData
 * @return {boolean|undefined}
 */
function isSupported(compatData) {
  if (compatData === undefined) {
    return undefined;
  }

  if (compatData.version_removed !== undefined) {
    return false;
  }

  return compatData.version_added !== false;
}

/**
 * @param {{permissions: any[]}} apiFuncOrEvent
 * @return {string[]}
 */
function getPermissions(namespacePermissions, apiFuncOrEvent) {
  const apiFuncPermissions = apiFuncOrEvent.permissions ?? [];
  return Array.from(
    new Set(
      [...namespacePermissions, ...apiFuncPermissions].map((p) => p.replace(/^manifest:/, ""))
    )
  );
}

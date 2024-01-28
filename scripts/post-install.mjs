import fs from "node:fs";
import zipJs from "@zip.js/zip.js/package.json" assert { type: "json" };

const zipJsModule = "./lib/zip-no-worker.js";

if (zipJs.module !== undefined && zipJs.module !== zipJsModule && zipJs.module !== "./index.js") {
  throw new Error(`zip.js module field already defined. Value: ${zipJs.module}`);
}

if (zipJs.module !== zipJsModule) {
  // Patching zip.js to help esbuild with tree shaking
  zipJs.module = zipJsModule;
  fs.writeFileSync(
    "./node_modules/@zip.js/zip.js/package.json",
    JSON.stringify(zipJs, undefined, 4),
    "utf-8"
  );
  console.log("Patched @zip.js/zip.js.");
} else {
  console.log("@zip.js/zip.js already patched.");
}

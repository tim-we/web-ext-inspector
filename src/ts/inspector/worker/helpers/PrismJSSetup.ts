/**
 * This code has to be executed before prismjs, order of imports matters:
 * ```js
 * import "PrismJSSetup.ts";
 * import Prism from "prismjs";
 * ```
 */

self.Prism = self.Prism || {};
// @ts-ignore
self.Prism.disableWorkerMessageHandler = true;
// @ts-ignore
self.Prism.manual = true;

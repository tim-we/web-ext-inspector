import apiInfos from "../../../data/api-compact.json";
import createUniqueId from "../../utilities/unique-id";

export default function createBrowserApi(self: Self): BrowserApi {
  // self will be updated to not expose these methods to the extension
  const postMessage = self.postMessage.bind(self);
  const addEventListener = self.addEventListener.bind(self);
  const removeEventListener = self.removeEventListener.bind(self);

  // biome-ignore lint/suspicious/noExplicitAny: TODO?
  const browser: Record<string, Record<string, any>> = {};
  const callbacks = new Map<string, () => unknown>();

  // add API functions
  for (const api of apiInfos.functions) {
    const [scope, method] = api.split(".");
    if (browser[scope] === undefined) {
      browser[scope] = {};
    }
    browser[scope][method] = (...args: unknown[]) => runApiMethod(api, args);
  }

  // add API events
  for (const apiEvent of apiInfos.events) {
    const [scope, event] = apiEvent.split(".");
    if (browser[scope] === undefined) {
      browser[scope] = {};
    }
    browser[scope][event] = Object.freeze({
      addListener(listener: () => void) {
        runApiMethod(apiEvent, [listener]);
      },
      removeListener(listener: () => void) {
        runApiMethod(apiEvent, [listener]);
      },
      hasListener(listener: () => void) {
        runApiMethod(apiEvent, [listener]);
        console.warn(`Running unimplemented method hasListener (${apiEvent})`);
      }
    });
  }

  Object.freeze(browser);
  Object.values(browser).forEach((scope) => Object.freeze(scope));

  function runApiMethod(api: string, args: unknown[]): unknown {
    const callStack = new Error().stack?.split("\n").map((e) => e.trim());
    console.log(`API:${api} called. Stack:`, callStack);
    // TODO: normalize format, filter entries from this file

    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === "function") {
        const callbackId = createUniqueId();
        callbacks.set(callbackId, args[i] as () => unknown);
        // TODO: avoid leaks, perhaps with WeakMap?
        args[i] = callbackId;
      }
    }
    return new Promise((resolve) => {
      const id = createUniqueId();
      postMessage({
        type: "api",
        id,
        api,
        arguments: args
      } as ApiMethodCallRequest);
      addEventListener(
        "message",
        function responseListener(e: MessageEvent<ApiMethodCallResponse>) {
          const response = e.data;
          if (response.type !== "api" || response.id !== id) {
            return;
          }
          removeEventListener("message", responseListener);
          response.removeCallbacks.forEach((callbackId) => callbacks.delete(callbackId));
          resolve(response.body);
        }
      );
    });
  }

  return browser;
}

export type ApiMethodCallRequest = {
  type: "api";
  id: string;
  api: string;
  arguments: unknown[];
};

export type ApiMethodCallResponse = {
  type: "api";
  id: string;
  body: unknown;
  removeCallbacks: string[];
};

type Self = {
  postMessage(data: unknown): void;
  addEventListener(event: "message", listener: (e: MessageEvent) => void): void;
  removeEventListener(event: "message", listener: (e: MessageEvent) => void): void;
};

type BrowserApi = Record<string, Record<string, () => Promise<unknown>>>;

//    // bookmarks
//    .addConstMethod("bookmarks.search", [])
//    // clipboard
//    .addConstMethod("clipboard.setImageData", undefined)
//    // extensions
//    .addConstMethod("extension.getViews", [])
//    .addConstMethod("extension.getBackgroundPage", null)
//    .addConstMethod("extension.isAllowedIncognitoAccess", false)
//    .addConstMethod("extension.isAllowedIncognitoAccess", undefined)
//    // runtime
//    .addConstMethod("runtime.getBackgroundPage", null)
//    .addConstMethod("runtime.openOptionsPage", undefined)
//    .addConstMethod("runtime.setUninstallURL", undefined)

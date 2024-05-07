import type BrowserAction from "./BrowserAction";
import BrowserBookmarks from "./BrowserBookmarks";
import type BrowserWindow from "./BrowserWindow";

export default class Browser {
  windows: BrowserWindow[] = [];
  bookmarks = new BrowserBookmarks();
  browserAction?: BrowserAction;
  cookies: string[] = []; // TODO
  extensionLocalStorage = null; // TODO
  extensionSessionStorage = null; // TODO
}

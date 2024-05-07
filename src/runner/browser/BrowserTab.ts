import type BrowserWindow from "./BrowserWindow";

export default class BrowserTab {
  window: BrowserWindow;
  title = "";
  url = "about:blank";

  constructor(window: BrowserWindow) {
    this.window = window;
  }
}

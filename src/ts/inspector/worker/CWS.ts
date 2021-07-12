const chromeVersion = "91.0.4472.114";
const arch = "x86-32";

export function getDownloadURL(extId: string): string {
    return `https://web-ext-download-eu.herokuapp.com/cws/${extId}`;
}

const chromeVersion = "96.0.4664.110";

export function getProxiedDownloadURL(extId: string): string {
    return `https://web-ext-download-eu.herokuapp.com/cws/${extId}`;
}

export function getDownloadURL(extId: string): string {
    const host = "clients2.google.com";
    const path = "/service/update2/crx";
    const params = `response=redirect&prodversion=${chromeVersion}&x=id%3D${extId}%26installsource%3Dondemand%26uc&nacl_arch=x86-64&acceptformat=crx2,crx3`;
    return `https://${host}${path}?${params}`;
}

export function getProxiedDownloadURL(extId: string): string {
  throw new Error("TODO");
}

export function getDownloadURL(extId: string): string {
  const host = "clients2.google.com";
  const path = "/service/update2/crx";
  const params = `response=redirect&prodversion=${__CHROME_VERSION__}&x=id%3D${extId}%26installsource%3Dondemand%26uc&nacl_arch=x86-64&acceptformat=crx2,crx3`;
  return `https://${host}${path}?${params}`;
}

/**
 * @returns {Promise<ChromeVersionsInfo>}
 */
async function getChromeVersionsInfo() {
  const response = await fetch(
    "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json",
    { mode: "cors" }
  );

  if (!response.ok) {
    return Promise.reject(
      new Error(`Failed to fetch chrome versions info (status ${response.status})`)
    );
  }

  return response.json();
}

/**
 * @typedef {Object} ChromeVersionsInfo
 * @property {string} timestamp - The timestamp of the version info.
 * @property {Object} channels - A record of Chrome channels.
 * @property {ChromeChannelInfo} channels.Stable - Stable channel info.
 * @property {ChromeChannelInfo} channels.Beta - Beta channel info.
 * @property {ChromeChannelInfo} channels.Dev - Dev channel info.
 * @property {ChromeChannelInfo} channels.Canary - Canary channel info.
 */

/**
 * @typedef {Object} ChromeChannelInfo
 * @property {"Stable" | "Beta" | "Dev" | "Canary"} channel - The name of the channel.
 * @property {string} version - The version string in the format "X.X.X.X".
 * @property {string} revision - The revision number.
 * @property {unknown} downloads - Download links (structure not relevant).
 */

await getChromeVersionsInfo()
  .then(
    (info) => info.channels.Stable.version,
    () => "137.0.7151.70" // fallback (12.06.2025)
  )
  .then(console.log);

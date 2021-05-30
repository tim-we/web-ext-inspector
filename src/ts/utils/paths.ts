export function cleanPath(dirtyPath: string): string {
    const fixedSeparators = dirtyPath.replace(/\\/g, "/").replace(/\+/g, "/");
    const fixedStart = fixedSeparators.replace(/^\.\//, "");
    const fixedEnd = fixedStart.replace(/\/$/, "");
    return fixedEnd;
}

export function getFolder(filePath: string): string {
    let parts = cleanPath(filePath).split("/");
    parts.pop();
    return parts.join("/");
}

export function joinPaths(path1: string, path2: string): string {
    const parts1 = cleanPath(path1).split("/");
    const parts2 = cleanPath(path2).split("/");
    return parts1.concat(parts2).join("/");
}

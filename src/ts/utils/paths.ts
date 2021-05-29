export function cleanPath(dirtyPath: string): string {
    const fixedSeparators = dirtyPath.replace(/\\/g, "/").replace(/\+/g, "/");
    const fixedStart = fixedSeparators.replace(/^[\.\/]/, "");
    const fixedEnd = fixedStart.replace(/\/$/, "");
    return fixedEnd;
}

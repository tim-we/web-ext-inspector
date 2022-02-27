const files = new Map<string, string>();

export function addFile(file: File): string {
    files.set(file.name, URL.createObjectURL(file));
    return file.name;
}

export function getURL(id: string): string | undefined {
    return files.get(id);
}

export function free(id: string): void {
    const url = files.get(id);
    if (url) {
        URL.revokeObjectURL(url);
    }
    files.delete(id);
}

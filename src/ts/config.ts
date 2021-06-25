const configOptions: Map<string, ConfigOption> = new Map();

const storage = window.localStorage;

export type ConfigOption = {
    id: string;
    label: string;
    type: "select";
    options: string[];
    default: string;
};

function addConfigOption(o: ConfigOption): void {
    configOptions.set(o.id, o);
}

addConfigOption({
    id: "open-files-in",
    label: "Open files in a",
    type: "select",
    options: ["modal", "popup", "tab"],
    default: "modal",
});

export function get<T>(id: string): T {
    const value = storage.getItem(`config.${id}`);
    const fallback = configOptions.get(id)?.default;

    return (value ?? fallback) as any as T;
}

export function getAll(): ConfigOption[] {
    return Array.from(configOptions.values());
}

export function set<T>(id: string, value: T): void {
    if (!configOptions.has(id)) {
        throw new Error("Not a valid config option.");
    }

    storage.setItem(`config.${id}`, "" + value);
}

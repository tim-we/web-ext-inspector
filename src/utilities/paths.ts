export function join(path: string, ...rest: string[]): string {
  if (rest.length === 0) {
    return path;
  }

  const joinedRest = join(rest[0], ...rest.slice(1));

  if (joinedRest.startsWith("/")) {
    throw new Error();
  }

  if (path.endsWith("/")) {
    return path + joinedRest;
  }

  return `${path}/${joinedRest}`;
}

export function dirname(path: string): string {
  const parts = path.replace(/^\//, "").split("/");
  const prefix = path.startsWith("/") ? "/" : "";

  if (parts.length === 1) {
    return prefix;
  }

  parts.pop();

  return prefix + parts.join("/");
}

export function segments(path: string): string[] {
  return path.replace(/^\//, "").split("/");
}

export function normalize(path: string): string {
  const absolute = path.startsWith("/");

  // Remove "." parts from path
  const parts = segments(path).filter((part) => part !== ".");

  // Resolve ".." parts in path:
  while (true) {
    const i = parts.findIndex((part) => part === "..");

    if (i < 1) {
      // If the path starts with .. (i=0) we cannot resolve that part.
      break;
    }

    // Remove ".." and the previous path part.
    parts.splice(i - 1, 2);
  }

  return (absolute ? "/" : "") + parts.join("/");
}

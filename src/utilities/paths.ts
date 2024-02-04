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

  if (parts.length === 1) {
    return "";
  }

  parts.pop();

  const prefix = path.startsWith("/") ? "/" : "";

  return prefix + parts.join("/");
}

export function segments(path: string): string[] {
  return path.replace(/^\//, "").split("/");
}

export function normalize(path: string): string {
  return path; // TODO
}

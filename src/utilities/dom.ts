export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  if (rect.right <= 0 || rect.bottom <= 0) {
    return false;
  }
  if (rect.left >= window.innerWidth || rect.top >= window.innerHeight) {
    return false;
  }
  const corners = [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.right, rect.bottom],
    [rect.left, rect.bottom]
  ] as const;
  return corners.find(([x, y]) => element.contains(document.elementFromPoint(x, y))) !== undefined;
}

export function scrollIntoViewIfNeeded(element: HTMLElement): void {
  if (isElementVisible(element)) {
    return;
  }
  element.scrollIntoView({
    block: "nearest"
  });
}

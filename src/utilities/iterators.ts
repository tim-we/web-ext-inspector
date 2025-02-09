export function count(iterator: Iterator<unknown, unknown, unknown>): number {
    let counter = 0;
    while (!iterator.next().done) {
        counter++;
    }
    return counter;
}

export function sum(iterator: Iterator<number, undefined, unknown>): number {
    let total = 0;
    let result = iterator.next();
    while (!result.done) {
      total += result.value;
      result = iterator.next();
    }
    return total;
  }
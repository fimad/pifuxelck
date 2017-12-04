export function mapFrom<T>(
    objects: T[], toId: (value: T) => string): {[id: string]: T} {
  const result = {} as {[id: string]: T};
  objects.forEach((x) => {
    result[toId(x)] = x;
  });
  return result;
}

export function compareStringsAsInts(a: string, b: string) {
  return parseInt(a, 10) - parseInt(b, 10);
}

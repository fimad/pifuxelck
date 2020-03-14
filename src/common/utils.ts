export function mapFrom<T>(
  objects: T[],
  toId: (value: T) => string
): { [id: string]: T } {
  const result = {} as { [id: string]: T };
  objects.forEach((x) => {
    result[toId(x)] = x;
  });
  return result;
}

export function compareStringsAsInts(a: string, b: string) {
  return parseInt(a, 10) - parseInt(b, 10);
}

export function objectWithoutKeys(obj: { [x: string]: any }, keys: string[]) {
  const result = { ...obj };
  keys.forEach((key: string) => delete result[key]);
  return result;
}

export function objectWithKeys(obj: { [x: string]: any }, keys: string[]) {
  const result = {} as { [x: string]: any };
  keys.forEach((key: string) => {
    result[key] = obj[key];
  });
  return result;
}

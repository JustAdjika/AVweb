export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}
export function isStringArrayArray(value: unknown): value is (string[])[] {
  return Array.isArray(value) && value.every(item => (
    Array.isArray(item) && item.every(itemInner => typeof itemInner === 'string')
  ));
}
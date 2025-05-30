export function extractUuid(str) {
  const uuidV4Regex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  const uuids = str.match(uuidV4Regex);

  return uuids ? uuids[uuids.length - 1] : null;
}

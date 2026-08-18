export function encodeObjectToUrl(obj: Record<any, any>) {
  const utf8 = new TextEncoder().encode(JSON.stringify(obj));
  const binary = String.fromCharCode(...utf8);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeObjectFromUrl(urlBase64: string) {
  const base64 = urlBase64
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(urlBase64.length + ((4 - (urlBase64.length % 4)) % 4), "=");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

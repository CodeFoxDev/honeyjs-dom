/*
  element {
    setAttribute,
    style,
    addEventListener
  }
*/

const isBrowser = typeof document !== undefined;

export function createElement(tag) {
  if (!isBrowser) return; // Render to string?
  return document.createElement(tag);
}

export function createTextNode(data) {
  if (!isBrowser) return; // Render to string?
  return document.createTextNode(data);
}
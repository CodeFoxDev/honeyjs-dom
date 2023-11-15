import { HTMLElement, TextNode } from "node-html-parser";

/*
  element {
    setAttribute,
    style,
    addEventListener
  }
*/

const isBrowser = typeof document != "undefined";

export function createElement(tag) {
  if (isBrowser) return document.createElement(tag);
  return new HTMLElement(tag, {
    class: "",
    id: ""
  });
}

export function createTextNode(data) {
  if (isBrowser) return document.createTextNode(data);
  return new TextNode(data);
}
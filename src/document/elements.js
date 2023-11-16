import { HTMLElement, TextNode, Node as _parser_Node } from "node-html-parser";
import { isBrowser } from "../index.js";

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

export function isComponent(element) {
  if (typeof element == "function" || Array.isArray(element)) return true;
  return isElement(element);
}

export function isElement(element) {
  if (element instanceof _parser_Node || (typeof Node != "undefined" && element instanceof Node)) return true;
  return false;
}
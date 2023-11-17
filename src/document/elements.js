import { HTMLElement, TextNode, Node as _parser_Node } from "node-html-parser";
import { isBrowser } from "../index.js";
import { attr_prefix, attr_STATICELEMENT, attr_STATICATTRIBUTES } from "./values.js";

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

/** @param {import("node-html-parser").HTMLElement} element */
export function isComponent(element) {
  if (typeof element == "function" || Array.isArray(element)) return true;
  return isElement(element);
}

/** @param {import("node-html-parser").HTMLElement} element */
export function isElement(element) {
  if ((element instanceof _parser_Node || (typeof Node != "undefined" && element instanceof Node)) && element.nodeType == 1) return true;
  return false;
}

/** @param {import("node-html-parser").HTMLElement} element */
export function isStatic(element) {
  if (isElement(element) && element.getAttribute(`${attr_prefix}:${attr_STATICELEMENT}`) == "true") return true;
  return false;
}

export function isStaticAttr(element) {
  if (isElement(element) && element.getAttribute(`${attr_prefix}:${attr_STATICATTRIBUTES}`) == "true") return true;
  return false;
}
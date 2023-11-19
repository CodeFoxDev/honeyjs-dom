/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */
import { parseAttributes } from "./attributes.js";
import { parseChildren } from "./children.js";
import { createElement } from "../document/elements.js";
import { renderingMode } from "./modes.js";
import { createEffect, isBrowser } from "../index.js";

/**
 * @param {string | Function} tag 
 * @param {object} attrs 
 * @param  {...any} children 
 * @returns {N.HTMLElement}
 */
export function h(tag, attrs, ...children) {
  /** @type { "fragment" | "custom" | "element" } */
  let type = (typeof tag == "function")
    ? (tag.isFragment == true ? "fragment" : "custom")
    : "element";
  /** @type {N.HTMLElement | null} */
  let element = null;
  attrs ??= {};

  if (type == "element") element = createElement(tag);
  else if (type == "custom") element = tag({ ...attrs, children });
  else if (type == "fragment") element = tag({ ...attrs, children }).children;

  if (Array.isArray(element)) type = "fragment";
  if (children) children = children.flat(Infinity);
  if (renderingMode == "Hydration") return { type, tag, attrs, children }

  return element;
}

/** @param {object} attrs */
export const Fragment = (attrs) => {
  return attrs;
}
Fragment.isFragment = true;

// Children

/**
 * @param {N.HTMLElement} parent 
 * @param {N.HTMLElement} child 
 * @param {N.HTMLElement} current 
 */
export function insert(parent, child, current) {
  if (parent == null || child == null) return;
  const t = typeof child;
  // Fragments and components
  if (Array.isArray(child)) child.map(_child => insert(parent, _child));
  else if (t == "function") {
    let current = null;
    createEffect(() => {
      let _child = child();
      if (_child == null || _child == undefined) _child = createElement("temp");
      current = insert(parent, _child, current);
    });
  } else if (isElement(child)) {
    if (current && isElement(current) && isBrowser) return parent.replaceChild(child, current);
    else return parent.appendChild(child);
  } else if (child == undefined) parent.removeChild(current);
  // Values
  if (t == "string") {
    if (current && isElement(current) && isBrowser) {
      const val = createTextNode(child)
      return parent.replaceChild(val, current);
    }
    else return parent.appendChild(createTextNode(child));
  } else if (t == "number" || (t == "boolean" && t != false) || child instanceof Date || child instanceof RegExp) {
    if (current && isElement(current) && isBrowser) {
      const val = createTextNode(child.toString());
      return parent.replaceChild(val, current);
    }
    else return parent.appendChild(createTextNode(child.toString()));
  }
}
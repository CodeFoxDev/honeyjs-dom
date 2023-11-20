/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */
import { parseAttributes } from "./attributes.js";
import { parseChildren } from "./children.js";
import { createElement, createTextNode, isElement } from "../document/elements.js";
import { renderingMode } from "./modes.js";
import { createEffect, isBrowser } from "../index.js";

/**
 * @param {string | Function} tag 
 * @param {object} attrs 
 * @param  {Array<N.HTMLElement>} children 
 * @returns {N.HTMLElement}
 */
export function h(tag, attrs, ...children) {
  /** @type { "fragment" | "custom" | "element" } */
  let type = (typeof tag == "function")
    ? (tag.isFragment == true ? "fragment" : "custom")
    : "element";
  /** @type {N.HTMLElement | Array<N.HTMLElement> | null} */
  let element = null;
  attrs ??= {};

  if (type == "element") element = createElement(tag);
  else if (type == "custom") element = tag({ ...attrs, children });
  else if (type == "fragment") element = children = tag({ ...attrs, children }).children;

  if (Array.isArray(element)) {
    children = element;
    type = "fragment";
  }
  if (children) children = children.flat(Infinity);
  if (renderingMode == "Hydration" || renderingMode == "Tree") {
    if (type == "fragment") return children;
    else return { type, tag, attrs, children }
  }

  if (type != "fragment") apply(element, attrs, type);
  if (type == "element") for (const child of children) insert(element, child);

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
    return current;
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

/**
 * @param {N.HTMLElement} element
 * @param { "fragment" | "custom" | "element" } type
 */
export function apply(element, attrs, type) {
  for (const key in attrs) {
    const val = attrs[key];
    const keyType = key.toLowerCase().startsWith("on") ? "event" : "prop";
    if (keyType == "event") {
      const event = key.toLowerCase().replace("on", "");
      // add event listener
    } else {
      const t = typeof val;
      const prop = key.toLowerCase() == "classname" ? "class" : key.toLowerCase();

      if (key == "style" && t == "object") { }// apply stule
      // Refs
      else if (key == "ref" && t == "function") val(element);
      else if (key == "ref" && t == "object") val.current = element;
      // Reactive attributes
      else if (t == "function") createEffect(() => {
        element.setAttribute(prop, val());
      });
      // Everything other
      else element.setAttribute(prop, val);
    }
  }
}
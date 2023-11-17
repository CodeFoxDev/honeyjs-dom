/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */

import { isElement, createElement, createTextNode } from "../document/elements";
import { createEffect } from "../signals.js";
import {
  attr_EVENTFULL as a_event,
  attr_STATICELEMENT as a_static,
  attr_STATICATTRIBUTES as a_attr,
  attr_prefix as a_prefix,
  attr_ISLAND as a_island,
} from "../document/values.js";
import { isBrowser } from "../index.js";

/**
 * 
 * @param {N.HTMLElement} element 
 * @param {Array<N.HTMLElement>} children 
 * @param {object} o 
 * @param {boolean} o.isCustom 
 * @param {boolean} o.isFragment
 * @param {boolean} o.staticAttributes
 */
export function parseChildren(element, children, o) {
  if (o.isCustom) return true;
  let isStatic = true;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if (o.isFragment || child == null || !isElement(element)) continue;
    if (!handleChild(element, child)) isStatic = false;
  }
  /* if (isElement(element) && staticChildren(element) && isStatic) element.setAttribute(`${a_prefix}:${a_static}`, true);
  else if (isElement(element) && o.staticAttributes) element.setAttribute(`${a_prefix}:${a_attr}`, true) */

  if (isElement(element)) {
    console.log(element.tagName, element.childNodes.length == 1 && isStatic == false);
    if (element.childNodes.length == 1 && isStatic == false) element.setAttribute(`${a_prefix}:${a_island}`, true);
    // TODO: Only rerender islands
  }

  return isStatic;
}

/**
 * @param {N.HTMLElement} element
 */
function staticChildren(element) {
  if (!element || !element.childNodes) return false;
  if (Array.from(element.childNodes).length == 0) return true;
  for (const e of Array.from(element.childNodes)) {
    if (e.getAttribute && e.getAttribute(`${a_prefix}:${a_static}`) == null) return false;
  }
  return true;
}

/**
 * @param {N.HTMLElement} parent 
 * @param {N.HTMLElement} child 
 * @param {N.HTMLElement} current 
 * @returns {boolean}
 */
export function handleChild(parent, child, current) {
  if (parent == null || child == null) return false;
  const t = typeof child;
  // Fragments and components
  if (Array.isArray(child)) return insertFragment(parent, child);
  else if (t == "function") return insertDynamic(parent, child);
  else if (isElement(child)) {
    if (current && isElement(current)) {
      parent.replaceChild(child, current);
      return true;
    }
    else parent.appendChild(child);
  } else if (child == undefined) parent.removeChild(current);
  // Values
  if (t == "string") {
    if (current && isElement(current)) {
      const val = createTextNode(child)
      parent.replaceChild(val, current);
      return true;
    }
    else parent.appendChild(createTextNode(child));
  } else if (t == "number" || (t == "boolean" && t != false) || child instanceof Date || child instanceof RegExp) {
    if (current && isElement(current)) {
      const val = createTextNode(child.toString());
      parent.replaceChild(val, current);
      return true;
    }
    else parent.appendChild(createTextNode(child.toString()));
  } else if (t == "object") {
    // Handle this?
  }
  return true;
}

/**
 * @param {HTMLElement} parent
 * @param {Function} dynamic
 */
export function insertDynamic(parent, dynamic) {
  let current = null;
  createEffect(() => {
    // TODO: Trigger event, that tells the js, that something has updated when this gets retriggered
    let child = dynamic();
    if (child == null || child == undefined) child = createPositionElement();
    current = handleChild(parent, child, current);
  });
  return false;
}

/**
 * @param {HTMLElement} parent
 * @param {Array} fragment
 */
export function insertFragment(parent, fragment) {
  if (!Array.isArray(fragment)) return false;
  let isStatic = true;
  fragment.forEach(child => {
    if (handleChild(parent, child) == true) isStatic = false;
  });
  return isStatic;
}

function createPositionElement() {
  const pos = createElement("pos");
  return pos;
}
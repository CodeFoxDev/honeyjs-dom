/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */

import { isElement } from "../document/elements.js";
import { createEffect } from "../signals.js";
import { isBrowser } from "../index.js";
import { renderingMode, hydrationRefernceElement } from "./modes.js";

const parseCustom = ["key", "ref", "preserve"];
const skipCustom = ["children"];

/**
 * @param {N.HTMLElement} element
 * @param {*} attrs
 * 
 * @param {object} o
 * @param {boolean} o.isCustom
 * @param {boolean} o.isFragment
 * 
 * @returns {boolean}
 */
export function parseAttributes(element, attrs, o) {
  if (Array.isArray(element) || o.isFragment) return;
  let isStatic = true;

  for (const name in attrs) {
    const value = attrs[name];

    //resolveToRoot(element, hydrationRefernceElement);

    if (skipCustom.includes(name) || (o.isCustom && !parseCustom.includes(name) && !event(name))) continue;
    if (event(name)) {
      // TODO: Implement event handler to change target on hydration
      registerElementEventListener(element, event(name), value);
      continue;
    }

    // Parse css objects
    if (name == "style" && typeof value == "object") applyStyle(element, value);
    // Parse element refs
    else if (name == "ref" && typeof value == "function") value(element);
    else if (name == "ref" && typeof value == "object") value.current = element;
    // Reactive attribute
    else if (typeof value == "function") createEffect(() => {
      isStatic = false;
      element.setAttribute(property(name), value())
    });
    // Everything others
    else element.setAttribute(property(name), value);
  }
  return isStatic;
}

// UNCHANGED

/** @param {string} prop */
function event(prop) {
  const event = prop.toLowerCase();
  if (!event.startsWith("on")) return false;
  return event.replace("on", "");
}

/** @param {string} prop */
function property(prop) {
  if (prop.toLowerCase() == "classname") return "class";
  return prop;
}

/**
 * @param {N.HTMLElement} element
 * @param {object} style
 */
export function applyStyle(element, style) {
  let res = {};
  for (const property in style) {
    let cssProp = property.replace(/[A-Z][a-z]*/g, str => '-' + str.toLowerCase() + '-')
      .replace('--', '-') // remove double hyphens
      .replace(/(^-)|(-$)/g, ''); // remove hyphens at the beginning and the end
    applyStyleProperty(element, cssProp, style[property]);
  }
  return res;
}

/**
 * @param {N.HTMLElement} element
 * @param {string} name
 * @param {string | boolean | number | Function} name
 */
export function applyStyleProperty(element, name, value) {
  if (!isElement(element)) return;
  const t = typeof value;
  const add = (key, val) => {
    let curr = element.getAttribute("style") ?? "";
    if (!curr.endsWith(";") && curr.length != 0) curr = curr + ";";
    if (curr.length != 0) curr = curr + " ";
    let keys = curr.split(";").map(e => e.split(":")[0]);
    if (!keys.includes(key)) return element.setAttribute("style", `${curr}${key}: ${val};`);
  }
  if (t == "string") add(name, value);
  else if (t == "boolean" || t == "number") add(name, value.toString());
  else if (t == "function") createEffect(() => add(name, value()));
}


function registerElementEventListener(element, event, callback) {
  if (isBrowser) return element.addEventListener(event, (e) => callback(e));
  //element.setAttribute(`${attr_prefix}:${attr_EVENTFULL}`, true);
}

// Hydration

/**
 * @param {N.HTMLElement} element 
 * @param {N.HTMLElement} root 
 */
function resolveToRoot(element, root) {
  if (!root || !root.childNodes) return;
  for (const child of root.childNodes) {
    console.log(child);
    resolveToRoot(element, child);
  }
}
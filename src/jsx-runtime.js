import { createEffect } from "./signals.js";
import { createElement, createTextNode } from "./document/elements.js";
import { isElement } from "./document/elements.js";
import { isBrowser } from "./index.js";
import { attr_prefix, attr_STATICELEMENT, attr_STATICATTRIBUTES, attr_EVENTFULL } from "./document/values.js";

const parseCustom = ["key", "ref", "preserve"];
const skipCustom = ["children"];

/* {
  tag: "p",
  attrs: {},
  children: []
} */

export function h(tag, attrs, ...children) {
  let isFragment = tag.isFragment == true;
  const isCustom = (typeof tag == "function") && !isFragment;
  const isNormalElement = !isFragment && !isCustom;
  let attrStatic = true;

  /** @type {HTMLElement | null} */
  let element = null;
  attrs ??= {};
  attrs.children = children;

  if (isNormalElement) element = createElement(tag);
  else if (isCustom) element = tag(attrs);
  else if (isFragment) {
    const data = tag(attrs);
    element = data.children ?? data;
  }
  else console.error("Something went wrong while parsing the tag information on a jsx component");

  if (Array.isArray(element)) isFragment = true;

  if (!isFragment) {
    for (let name in attrs) {
      const value = attrs[name];

      if (skipCustom.includes(name) || (isCustom && !parseCustom.includes(name) && !event(name))) continue;
      else if (event(name)) registerElementEventListener(element, event(name), value);
      else {
        if (name == "style" && typeof value == "object") style(element, value);
        else if (name == "ref") {
          if (typeof value == "function") value(element);
          else if (typeof value == "object") value.current = element;
        }
        else if (typeof value == "function") createEffect(() => {
          attrStatic = false;
          element.setAttribute(property(name), value())
        });
        else element.setAttribute(property(name), value);
      }
    }
  }

  if (!isCustom) {
    let childrenStatic = true;
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (isFragment || child == null || !isElement(element)) continue;
      if (!handleChild(element, child)) childrenStatic = false;
    }
    if (isElement(element) && staticChildren(element) && childrenStatic) element.setAttribute(`${attr_prefix}:${attr_STATICELEMENT}`, true);
    else if (isElement(element) && attrStatic/*  && !element.getAttribute(`${attr_prefix}:${attr_EVENTFULL}`) */) element.setAttribute(`${attr_prefix}:${attr_STATICATTRIBUTES}`, true)
  }

  return element;
}

/** @param {object} attrs */
export const Fragment = (attrs) => {
  return attrs;
}
Fragment.isFragment = true;

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

/** @param {HTMLElement} element */
function style(element, style) {
  let res = {};
  for (const property in style) {
    let cssProp = property.replace(/[A-Z][a-z]*/g, str => '-' + str.toLowerCase() + '-')
      .replace('--', '-') // remove double hyphens
      .replace(/(^-)|(-$)/g, ''); // remove hyphens at the beginning and the end
    setStyle(element, cssProp, style[property]);
  }
  return res;
}

/**
 * @param {HTMLElement} element
 */
function setStyle(element, name, value) {
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

/**
 * @param {import("node-html-parser").HTMLElement} element
 */
function staticChildren(element) {
  if (!element || !element.childNodes) return false;
  if (Array.from(element.childNodes).length == 0) return true;
  for (const e of Array.from(element.childNodes)) {
    if (e.getAttribute && e.getAttribute(`${attr_prefix}:${attr_STATICELEMENT}`) == null) return false;
  }
  return true;
}

/**
 * Registers an event listener of type `event` to `element`
 * @param {HTMLElement} element
 * @param {string} event
 * @param {Function} callback
 */
function registerElementEventListener(element, event, callback) {
  if (isBrowser) return element.addEventListener(event, (e) => callback(e));
  element.setAttribute(`${attr_prefix}:${attr_EVENTFULL}`, true);
}

/** @param {HTMLElement} parent */
function handleChild(parent, child, current) {
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

/** @param {HTMLElement} parent */
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

/** @param {HTMLElement} parent */
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
import { createElement } from "./elements.js";
import { isComponent, isElement, isStatic, isStaticAttr } from "./elements.js";
import { attr_prefix, attr_STATICELEMENT, attr_STATICATTRIBUTES } from "./values.js";

// Populate root with page component

/** @type {import("../types").renderToDom} */
export function renderToDom(root, page) {
  if (!isElement(root)) return console.error("Please provide a root");
  if (!isComponent(page)) return console.error("Invalid parameter passed for page");
  const ele = (typeof page == "function") ? page() : page;
  root.innerHTML = "";

  if (Array.isArray(ele)) {
    ele.flat(Infinity).forEach(child => {
      root.appendChild(child);
    })
  } else {
    root.appendChild(contents);
  }
}

// Hydrate the html to client side code
//    - Add event listeners
//    - Update elements that have dynamic attributes or children

/** @type {import("../types").hydrateDom} */
export function hydrateDom(root, page, options) {
  loadDefaults(options);

  if (!isElement(root)) return console.error("Please provide a root");
  if (!isComponent(page)) return console.error("Invalid parameter passed for page");
  const ele = [(typeof page == "function") ? page() : page].flat(Infinity);
  const body = Array.from(root.children);
  if (ele.length != body.length) return handleInvalidHydration(root, page, options);

  replaceElements(body, ele, options);
}

/** @type {import("../types").hydrateDom} */
function handleInvalidHydration(root, page, options) {
  console.error("Root isn't the same as Page");
  if (options.overwrite) renderToDom(root, page);
}

// Compare functions

/** @type {import("../types").hydrateDom} */
function compareElements(root, page, options) {
  if (Array.isArray(root) && Array.isArray(page)) {
    if (root.length != page.length) return false;
    for (let i = 0; i < root.length; i++) if (compareElements(root[i], page[i], options) == false) return false;
    return true;
  } else if (!Array.isArray(root) && !Array.isArray(page)) {
    if (root.tagName != page.tagName) return false;
    if (!compareAttributes(root, page, options)) return false;
    const children = Array.from(root.childNodes);
    if (children.length == 0) return true;
    for (let i = 0; i < children.length; i++) {
      if (compareElements(root.childNodes[i], page.childNodes[i], options) == false) return false;
    }
    return true;
  }
}

/**
 * @param {import("node-html-parser").HTMLElement} root 
 * @param {import("node-html-parser").HTMLElement} page 
 * @param {import("../types").DomOptions} options 
 */
function compareAttributes(root, page, options) {
  if (root.nodeType != 1) return true;
  const attrStatic = root.getAttribute(`${attr_prefix}:${attr_STATICATTRIBUTES}`) == "true";
  const r_attr = parseAttributes(root.attributes);
  const p_attr = parseAttributes(page.attributes);
  const keys = Object.keys(r_attr);
  if (keys.length != Object.keys(p_attr).length) return false;
  // Strict checks
  if (attrStatic || options.strictness == 2) {
    // TODO: Compare arrays before checking?
    for (const key of keys) {
      if (!p_attr[key]) return false;
      if (r_attr[key] !== p_attr[key]) return false;
    }
  }
  return true;
}

// Replace functions

/*
Loop over every element
- does it have the h:static property, skip it and its children
- if it has static attributes and 1 or more child is static, skip it and loop over children

Problems
- Refs

Solutions
- Different strategy to rendering / jsx runtime?
*/

/** @type {import("../types").hydrateDom} */
function replaceElements(root, page, options) {
  if (Array.isArray(root) && Array.isArray(page)) {
    if (root.length != page.length) return false;
    for (let i = 0; i < root.length; i++) if (replaceElements(root[i], page[i], options) == false) return false;
    return true;
  }
  if (isStatic(root)) return true;
  console.log(root, page);
}

/** @param {import("../types").DomOptions} options */
function loadDefaults(options) {
  options ??= {}
  options.overwrite ??= false;
  options.strictness ??= 1;
}

// Helper functions
function parseAttributes(attributes) {
  const arr = Array.from(attributes);
  const res = {};
  arr.forEach(e => res[e.name] = e.value);
  return res;
}

// Returns html as string

/** @type {import("../types").renderToHTML} */
export function renderToHTML(page) {
  if (typeof page == "function") page = page();
  if (!isComponent(page)) {
    console.error("Invalid parameter passed for page");
    return "";
  }

  const root = createElement("div");
  renderToDom(root, page);
  return root.innerHTML;
}
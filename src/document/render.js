import { createElement } from "./elements.js";
import { render } from "../runtime/modes.js";
import { isComponent, isElement, isStatic, isStaticAttr } from "./elements.js";
import { attr_prefix, attr_STATICELEMENT, attr_STATICATTRIBUTES } from "./values.js";

// Populate root with page component

/** @type {import("../types").renderToDom} */
export function renderToDom(root, page) {
  if (!isElement(root)) return console.error("Please provide a root");
  if (!isComponent(page)) return console.error("Invalid parameter passed for page");
  const ele = render(page, { mode: "CSR" });
  root.innerHTML = "";

  if (Array.isArray(ele)) {
    ele.flat(Infinity).forEach(child => {
      root.appendChild(child);
    })
  } else {
    root.appendChild(ele);
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
  const ele = [render(page, { mode: "Hydration", root: root })].flat(Infinity);
  const body = Array.from(root.children);
  if (ele.length != body.length) return handleInvalidHydration(root, page, options);

  //replaceElements(body, ele, options);
}

/** @type {import("../types").hydrateDom} */
function handleInvalidHydration(root, page, options) {
  console.error("Root isn't the same as Page");
  if (options.overwrite) renderToDom(root, page);
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
  page = render(page, { mode: "SSR" });
  if (!isComponent(page)) {
    console.error("Invalid parameter passed for page");
    return "";
  }

  const root = createElement("div");
  renderToDom(root, page);
  return root.innerHTML;
}
/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */

import { apply, insert } from "./index.js";

/** @type {"SSR" | "CSR" | "Hydration" | "Tree"} */
export let renderingMode = "CSR";
export let hydrationRefernceElement = null;

/**
 * @param {Function} component
 * @param {object} o
 * @param {"SSR" | "CSR" | "Hydration" | "Tree"} o.mode
 * @param {N.HTMLElement} o.root
 */
export function render(component, o) {
  if (typeof component != "function") return component;
  const prevMode = renderingMode;
  renderingMode = o.mode ?? "CSR";
  if (o.mode == "Hydration") {
    if (!o.root) return component;
    hydrationRefernceElement = o.root
  }

  const before = performance.now();

  const page = component();
  if (o.mode == "Hydration") attach(o.root, page, o);

  console.log(`${o.mode == "Hydration" ? "Hydration" : "Rendering"} took: ${performance.now() - before} ms`);

  // Reset to default
  renderingMode = prevMode;
  hydrationRefernceElement = null;
  return page;
}

/**
 * @param {HTMLElement} root 
 * @param {object} page 
 * @param {object} options 
 */
export function attach(root, page, options) {
  const children = Array.from(root.childNodes);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const item = (typeof page == "function") ? page : (Array.isArray(page) ? page[i] : page.children[i]);
    const t = typeof item;
    if (t == "function") insert(root, item(), child);
    else apply(child, item.attrs, item.type);

    //console.log(item);
    attach(child, item, options);
  }
}
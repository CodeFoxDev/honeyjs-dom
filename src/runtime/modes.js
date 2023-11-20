/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */

import { isBrowser } from "..";

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

  component = component();
  if (isBrowser) console.log(component);

  console.log(`rendering took: ${performance.now() - before} ms`);

  // Reset to default
  renderingMode = prevMode;
  hydrationRefernceElement = null;
  return component;
}
/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */

export let renderingMode = "CSR";
export let hydrationRefernceElement = null;

/**
 * @param {Function} component
 * @param {object} o
 * @param {"SSR" | "CSR" | "Hydration"} o.mode
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

  console.log(`rendering took: ${performance.now() - before} ms`);

  // Reset to default
  renderingMode = prevMode;
  hydrationRefernceElement = null;
  return component;
}
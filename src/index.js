export { createEffect, createMemo, createSignal, createRef } from "./signals.js";
export { hydrateDom, renderToDom, renderToHTML, renderToTree } from "./document/render.js";

export const isBrowser = typeof document != "undefined";
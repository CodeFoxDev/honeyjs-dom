export { createEffect, createMemo, createSignal, createRef } from "./signals.js";
export { hydrateDom, renderToDom, renderToHTML } from "./document/render.js";

export const isBrowser = typeof document != "undefined";
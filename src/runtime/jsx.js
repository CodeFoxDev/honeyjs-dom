/**
 * @namespace N
 * @typedef {import("node-html-parser").HTMLElement} N.HTMLElement
 * @typedef {import("node-html-parser").TextNode} N.TextNode
 */
import { parseAttributes } from "./attributes.js";
import { parseChildren } from "./children.js";
import { createElement } from "../document/elements.js";
import { renderingMode, hydrationRefernceElement } from "./modes.js";

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

  if (Array.isArray(element)) isFragment = true;

  //console.log(element);

  const staticAttributes = parseAttributes(element, attrs, {
    isCustom: isCustom
  });

  parseChildren(element, children, {
    isCustom: isCustom,
    isFragment: isFragment,
    staticAttributes
  });

  return element;
}

/** @param {object} attrs */
export const Fragment = (attrs) => {
  return attrs;
}
Fragment.isFragment = true;
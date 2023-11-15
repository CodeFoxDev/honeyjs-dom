import { createElement } from "./elements.js";
import { isComponent, isElement } from "./elements.js";

// Populate root with page component
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
export function hydrateDom(root, page) {
  if (!isElement(root)) return console.error("Please provide a root");
  if (!isComponent(page)) return console.error("Invalid parameter passed for page");
  const ele = (typeof page == "function") ? page() : page;
}

// Returns html as string
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
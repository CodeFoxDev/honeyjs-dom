import { HTMLElement } from "node-html-parser";

export function renderToDom(root, page) {
  if (!(root instanceof HTMLElement)) return console.error("Please provide a root");
  if (!page || !(typeof page == "function" || page instanceof HTMLElement)) return console.error("Invalid parameter passed for page");
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

export function hydrateDom(root, page) {
  if (!(root instanceof HTMLElement)) return console.error("Please provide a root");
  if (!page || typeof page != "function" || !(page instanceof HTMLElement)) return console.error("Invalid parameter passed for page");
  const ele = (typeof page == "function") ? page() : page;
}

// Returns html as string
export function renderToHTML(page) {
  if (typeof page == "function") page = page();
  if (!(page instanceof HTMLElement)) return console.error("Page parameter not valid component");

  const root = new HTMLElement("div", {
    id: "app",
    class: ""
  });
  renderToDom(root, page);
  return root.innerHTML;
}
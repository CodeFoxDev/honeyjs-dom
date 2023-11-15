export function renderToDom(root, page) {
  if (!(root instanceof HTMLElement)) return console.error("Please provide a root");
  if (!page || typeof page != "function" || !(page instanceof HTMLElement)) return console.error("Invalid parameter passed for page");
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

}

// Returns html as string
export function renderToHTML(page) {

}

/**
 * @param {Function} component 
 */
function render(component) {
  const contents = component();
  AppRoot.innerHTML = "";

  if (Array.isArray(contents)) {
    contents.flat(Infinity).forEach(child => {
      AppRoot.appendChild(child);
    })
  } else {
    AppRoot.appendChild(contents);
  }
}
import {
  productById,
  MAX_QUANTITY,
  restoreCart,
  changeQuantity,
  cartSummary,
  matchesProduct,
} from "./cart.mjs";

const storageKey = "saad-food-bag-v1";
const dialog = document.querySelector("#bag-dialog");
const bagItems = document.querySelector("#bag-items");
const bagButton = document.querySelector("#open-bag");
const search = document.querySelector("#menu-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const cards = [...document.querySelectorAll(".product")];
const toast = document.querySelector("#toast");
const money = (cents) => `$${(cents / 100).toFixed(2)}`;
let cart = {};
let category = "All";
let toastTimer;

try {
  cart = restoreCart(localStorage.getItem(storageKey));
} catch {
  /* Storage can be blocked. */
}

function announce(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = setTimeout(() => {
    toast.textContent = "";
  }, 3500);
}

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch {
    /* The bag still works in memory. */
  }
}

function renderBag() {
  const { count, total } = cartSummary(cart);
  document.querySelector("#bag-count").textContent = String(count);
  bagButton.setAttribute(
    "aria-label",
    `Your bag, ${count} ${count === 1 ? "item" : "items"}`,
  );
  document.querySelector("#bag-total").textContent = money(total);
  document.querySelector("#bag-summary").hidden = count === 0;
  // Only fixed catalogue values and validated integer quantities enter this markup.
  bagItems.innerHTML = count
    ? Object.entries(cart)
        .map(([id, quantity]) => {
          const product = productById.get(id);
          return `<div class="bag-item"><div class="bag-item-heading"><strong>${product.name}</strong><span>${money(product.price * quantity)}</span></div>
      <div class="bag-item-controls"><div class="quantity-controls"><button type="button" data-change="-1" data-id="${id}" aria-label="Decrease ${product.name.toLowerCase()} quantity">−</button><output aria-label="${product.name} quantity">${quantity}</output><button type="button" data-change="1" data-id="${id}" aria-label="Increase ${product.name.toLowerCase()} quantity" ${quantity === MAX_QUANTITY ? "disabled" : ""}>+</button></div><button class="remove-item" type="button" data-remove="${id}" aria-label="Remove ${product.name.toLowerCase()}">Remove</button></div></div>`;
        })
        .join("")
    : '<p class="empty-bag">Your bag is waiting for something good. Explore the menu and add a favourite.</p>';
}

function updateCart(next) {
  cart = next;
  saveCart();
  renderBag();
}

function filterMenu() {
  let count = 0;
  cards.forEach((card) => {
    const visible = matchesProduct(
      productById.get(card.dataset.id),
      category,
      search.value,
    );
    card.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector("#result-count").textContent =
    `${count} ${count === 1 ? "item" : "items"}`;
  document.querySelector("#empty-results").hidden = count > 0;
}

filterButtons.forEach((button) =>
  button.addEventListener("click", () => {
    category = button.dataset.filter;
    filterButtons.forEach((filter) =>
      filter.setAttribute("aria-pressed", String(filter === button)),
    );
    filterMenu();
  }),
);
search.addEventListener("input", filterMenu);
document.querySelector("#reset-filters").addEventListener("click", () => {
  category = "All";
  search.value = "";
  filterButtons.forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === category),
    ),
  );
  filterMenu();
  search.focus();
});

document.querySelector("#product-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  if (cart[id] === MAX_QUANTITY) {
    announce(`You can add up to ${MAX_QUANTITY} of each item.`);
    return;
  }
  updateCart(changeQuantity(cart, id, 1));
  announce(`${productById.get(id).name} added to your bag.`);
});

bagItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = button.dataset.id || button.dataset.remove;
  const change = button.dataset.remove
    ? -(cart[id] || 0)
    : Number(button.dataset.change);
  updateCart(changeQuantity(cart, id, change));
  // Keep keyboard focus inside the changed row, or on the next available action.
  const equivalent = [...bagItems.querySelectorAll("button")].find(
    (candidate) =>
      candidate.dataset.id === id &&
      candidate.dataset.change === button.dataset.change &&
      !candidate.disabled,
  );
  (
    equivalent ||
    bagItems.querySelector("button") ||
    document.querySelector("#continue-browsing")
  ).focus();
});

bagButton.addEventListener("click", () => dialog.showModal());
document
  .querySelector("#close-bag")
  .addEventListener("click", () => dialog.close());
document
  .querySelector("#continue-browsing")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    dialog.close();
});
dialog.addEventListener("close", () => bagButton.focus());
document.querySelector("#clear-bag").addEventListener("click", () => {
  updateCart({});
  document.querySelector("#continue-browsing").focus();
});
window.addEventListener("storage", (event) => {
  if (event.key === storageKey || event.key === null) {
    cart = restoreCart(event.newValue);
    renderBag();
  }
});

renderBag();
document
  .querySelectorAll("[data-add], #open-bag, #menu-toolbar, #search-wrap")
  .forEach((control) => {
    control.hidden = false;
  });

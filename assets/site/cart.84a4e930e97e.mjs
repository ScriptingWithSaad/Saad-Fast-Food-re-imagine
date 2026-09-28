import { products } from "./products.193f3e882c8b.mjs";

export const productById = new Map(
  products.map((product) => [product.id, product]),
);
export const MAX_QUANTITY = 99;

export function restoreCart(serialized) {
  try {
    const data = JSON.parse(serialized);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(
        ([id, quantity]) =>
          productById.has(id) &&
          Number.isInteger(quantity) &&
          quantity > 0 &&
          quantity <= MAX_QUANTITY,
      ),
    );
  } catch {
    return {};
  }
}

export function changeQuantity(cart, id, change) {
  if (!productById.has(id) || !Number.isInteger(change)) return cart;
  const next = { ...cart };
  const quantity = Math.min(MAX_QUANTITY, (next[id] || 0) + change);
  if (quantity <= 0) delete next[id];
  else next[id] = quantity;
  return next;
}

export function cartSummary(cart) {
  return Object.entries(cart).reduce(
    (summary, [id, quantity]) => {
      const product = productById.get(id);
      if (product) {
        summary.count += quantity;
        summary.total += product.price * quantity;
      }
      return summary;
    },
    { count: 0, total: 0 },
  );
}

export function matchesProduct(product, category, query) {
  return (
    (category === "All" || product.category === category) &&
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
}

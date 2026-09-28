import test from "node:test";
import assert from "node:assert/strict";
import {
  changeQuantity,
  restoreCart,
  cartSummary,
  matchesProduct,
} from "../script/cart.mjs";
import { products } from "../script/products.mjs";

test("last-unit removal removes the row and produces an exact zero subtotal", () => {
  let cart = changeQuantity({}, "cheeseburger", 2);
  assert.deepEqual(cartSummary(cart), { count: 2, total: 2198 });
  cart = changeQuantity(cart, "cheeseburger", -1);
  cart = changeQuantity(cart, "cheeseburger", -1);
  assert.deepEqual(cart, {});
  assert.deepEqual(cartSummary(cart), { count: 0, total: 0 });
});
test("mixed items use integer cents and removing one line preserves other items", () => {
  const cart = { "classic-burger": 3, "strawberry-shake": 2 };
  assert.deepEqual(cartSummary(cart), { count: 5, total: 4395 });
  assert.deepEqual(changeQuantity(cart, "classic-burger", -3), {
    "strawberry-shake": 2,
  });
  assert.equal(cart["classic-burger"], 3);
});
test("storage rejects removed products, malformed input, and invalid quantities", () => {
  for (const value of ["bad json", "null", "[]", '"text"'])
    assert.deepEqual(restoreCart(value), {});
  assert.deepEqual(
    restoreCart(
      JSON.stringify({
        "classic-burger": 2,
        obsolete: 3,
        pizza: -1,
        "hot-dog": "4",
        "chocolate-shake": 1.5,
        cheeseburger: 100,
        "roast-chicken": 0,
      }),
    ),
    { "classic-burger": 2 },
  );
});
test("invalid ids and changes cannot enter the bag; quantities are capped", () => {
  assert.deepEqual(changeQuantity({}, "__proto__", 1), {});
  assert.deepEqual(changeQuantity({}, "pizza", NaN), {});
  assert.deepEqual(changeQuantity({ pizza: 99 }, "pizza", 1), { pizza: 99 });
});
test("search combines with categories, handles case, whitespace and no results", () => {
  const matching = (category, query) =>
    products.filter((product) => matchesProduct(product, category, query));
  assert.equal(products.length, 8);
  assert.equal(matching("Burgers", "").length, 2);
  assert.equal(matching("All", " SHAKE ").length, 2);
  assert.equal(matching("Mains", "shake").length, 0);
  assert.equal(matching("All", "not on the menu").length, 0);
});

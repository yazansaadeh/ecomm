const express = require("express");
const cartsRepo = require("../repositories/carts");
const productsRepo = require("../repositories/products");
const cartShowTemplate = require("../views/cart/show");

const Router = express.Router();

Router.post("/cart/products", async (req, res) => {
  let cart;
  if (!req.session.cartId) {
    cart = await cartsRepo.creat({ items: [] });
    req.session.cartId = cart.id;
  } else {
    cart = await cartsRepo.findUserById(req.session.cartId);
  }
  const existingItem = cart.items.find(
    (item) => item.id === req.body.productId
  );
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }
  await cartsRepo.update(cart.id, { items: cart.items });
  res.redirect("/cart");
});
Router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/");
  }
  const cart = await cartsRepo.findUserById(req.session.cartId);
  for (let item of cart.items) {
    const product = await productsRepo.findUserById(item.id);
    item.product = product;
  }
  res.send(cartShowTemplate({ items: cart.items }));
});
Router.post("/cart/products/delete", async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.findUserById(req.session.cartId);
  const items = cart.items.filter((item) => item.id !== itemId);
  cartsRepo.update(req.session.cartId, { items });
  res.redirect("/cart");
});
module.exports = Router;

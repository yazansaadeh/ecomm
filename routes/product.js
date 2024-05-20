const express = require("express");
const productsRepo = require("../repositories/products");
const productsIndexTemplate = require("../views/product/index");
const Router = express.Router();

Router.get("/", async (req, res) => {
  const products = await productsRepo.getAll();
  res.send(productsIndexTemplate({ products }));
});
module.exports = Router;

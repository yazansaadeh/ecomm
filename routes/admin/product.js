const express = require("express");
const productIndexTemplate = require("../../views/admin/product/index");
const productEditTemplate = require("../../views/admin/product/edit");
const { handleErrors, requireAuth } = require("./middleware");
const multer = require("multer");

const { requireTitle, requirePrice } = require("./validators");
const productsRepo = require("../../repositories/products");
const productNewTemplate = require("../../views/admin/product/new");

const Router = express.Router();
const upload = multer({ Storage: multer.memoryStorage() });

Router.get("/admin/products", requireAuth, async (req, res) => {
  const products = await productsRepo.getAll();
  res.send(productIndexTemplate({ products }));
});

Router.get("/admin/products/new", requireAuth, (req, res) => {
  res.send(productNewTemplate({}));
});
Router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString("base64");
    const { title, price } = req.body;
    await productsRepo.creat({ title, price, image });
    res.redirect("/admin/products");
  }
);
Router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  const product = await productsRepo.findUserById(req.params.id);
  if (!product) {
    return res.send("Product not found");
  }
  res.send(productEditTemplate({ product }));
});
Router.post(
  "/admin/products/:id/edit",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productEditTemplate, async (req) => {
    const product = await productsRepo.getOneBy({ id: req.params.id });
    return { product };
  }),
  async (req, res) => {
    const change = req.body;
    if (req.file) {
      change.image = req.file.buffer.toString("base64");
    }
    try {
      await productsRepo.update(req.params.id, change);
    } catch (error) {
      res.send("Product not found");
    }
    res.redirect("/admin/products");
  }
);
Router.post("/admin/products/:id/delete", requireAuth, async (req, res) => {
  productsRepo.deletUser(req.params.id);
  res.redirect("/admin/products");
});

module.exports = Router;

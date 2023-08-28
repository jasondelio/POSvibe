const router = require("express").Router();
const Product = require("../models/product-model");
const { isBase64ImageValid } = require("../utility/isBase64ImageValid");
const { compressImage } = require("../utility/compressImage.js");

router.get("/health-check", async (req, res, next) => {
  res.send("Server is up");
});

router.get("/", async (req, res, next) => {
  const productList = await Product.find({});
  res.json(productList);
});

router.get("/:name", async (req, res, next) => {
  const product = await Product.findOne({ name: req.params.name });
  if (!product) {
    console.log(`Product ${req.params.name} does not exist`);
    res.status(400).json({ message: "Product does not exist" });
    return;
  }

  res.json(product);
});

router.post("/", async (req, res, next) => {
  const product = await Product.findOne({ name: req.body.name });

  if (product) {
    if (product.name.toUpperCase() === req.body.name.trim().toUpperCase()) {
      console.log(`Product ${req.body.name} already exists`);
      res.status(400).json({ message: "Product name already exists" });
      return;
    }
  }

  if (req.body.imgData.imgUrl && !isBase64ImageValid(req.body.imgData.imgUrl)) {
    console.log("Invalid image data format");
    return res.status(400).json({ message: "Invalid image data format" });
  }

  try {
    const newProduct = new Product(req.body);
    if (req.body.imgData.imgUrl) {
      const compressedImgUrl = await compressImage(req.body.imgData.imgUrl);
      newProduct.imgData.imgUrl = compressedImgUrl;
    }
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:name", async (req, res, next) => {
  const product = await Product.findOne({ name: req.params.name });

  if (!product) {
    console.log(`Product ${req.params.name} does not exist`);
    res.status(400).json({ message: "Product does not exist" });
    return;
  }

  const deletedProduct = await Product.deleteOne({ name: req.params.name });
  res.json(deletedProduct);
});

router.put("/:name", async (req, res, next) => {
  const product = await Product.findOne({ name: req.params.name });
  if (!product) {
    console.log(`Product ${req.params.name} does not exist`);
    res.status(400).json({ message: "Product does not exist" });
    return;
  }

  if (req.body.imgData.imgUrl && !isBase64ImageValid(req.body.imgData.imgUrl)) {
    console.log("Invalid image data format");
    return res.status(400).json({ message: "Invalid image data format" });
  }

  const updatedProduct = await Product.findOne({ name: req.body.name });

  if (updatedProduct && updatedProduct.name != req.params.name) {
    if (
      updatedProduct.name.toUpperCase() === req.body.name.trim().toUpperCase()
    ) {
      console.log(`Product ${req.body.name} already exists`);
      res.status(400).json({ message: "Product name already exists" });
      return;
    }
  }

  try {
    product.name = req.body.name;
    product.category = req.body.category;
    product.price = req.body.price;
    product.isOutOfStock = req.body.isOutOfStock;
    product.description = req.body.description;

    if (req.body.imgData.imgUrl !== product.imgData) {
      const compressedImgUrl = await compressImage(req.body.imgData.imgUrl);
      product.imgData.imgUrl = compressedImgUrl;
    } else {
      product.imgData = req.body.imgData;
    }

    const savedProduct = await product.save();

    res.json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

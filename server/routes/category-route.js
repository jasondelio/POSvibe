const router = require("express").Router();
const Category = require("../models/category-model");
const Product = require("../models/product-model")

router.get("/health-check", async (req, res, next) => {
  res.send("Server is up");
});

router.get("/", async (req, res, next) => {
  const categoryList = await Category.find({});
  res.json(categoryList);
});

router.get("/:name", async (req, res, next) => {
  const category = await Category.findOne({ name: req.params.name });
  if (!category) {
    console.log(`Category ${req.params.name} does not exist`);
    res.status(400).json({ message: "Category does not exist" });
    return;
  }

  res.json(category);
});

router.post("/", async (req, res, next) => {
  const category = await Category.findOne({ name: req.body.name });

  if (category) {
    if (category.name.toUpperCase() === req.body.name.trim().toUpperCase()) {
      console.log(`Category ${req.body.name} already exists`);
      res.status(400).json({ message: "Category name already exists" });
      return;
    }
  }

  const newCategory = new Category(req.body);
  const savedCategory = await newCategory.save();
  res.json(savedCategory);
});

router.delete("/:name", async (req, res, next) => {
  const category = await Category.findOne({ name: req.params.name });

  if (!category) {
    console.log(`Category ${req.params.name} does not exist`);
    res.status(400).json({ message: "Category does not exist" });
    return;
  }

  try {
    const updateResult = await Product.updateMany({ category: req.params.name }, { category: "" });
    console.log(`${updateResult.modifiedCount} products updated.`);
  } catch (err) {
    console.error('Error updating products:', err);
    res.status(400).json({ message: "Error updating products" });
  }

  const deletedCategory = await Category.deleteOne({ name: req.params.name });
  res.json(deletedCategory);
});

router.put("/:name", async (req, res, next) => {
  const category = await Category.findOne({ name: req.params.name });
  if (!category) {
    console.log(`Category ${req.params.name} does not exist`);
    res.status(400).json({ message: "Category does not exist" });
    return;
  }

  const updatedCategory = await Category.findOne({ name: req.body.name });

  if (updatedCategory && updatedCategory.name != req.params.name) {
    if (
      updatedCategory.name.toUpperCase() === req.body.name.trim().toUpperCase()
    ) {
      console.log(`Category ${req.body.name} already exists`);
      res.status(400).json({ message: "Category name already exists" });
      return;
    }
  }

  try {
    const updateResult = await Product.updateMany({ category: req.params.name }, { category: req.body.name });
    console.log(`${updateResult.modifiedCount} products updated.`);
  } catch (err) {
    console.error('Error updating products:', err);
    res.status(400).json({ message: "Error updating products" });
  }

  category.name = req.body.name;
  category.description = req.body.description;

  const savedCategory = await category.save();

  res.json(savedCategory);
});

module.exports = router;

const router = require("express").Router();
const Table = require("../models/table-model");

router.get("/health-check", async (req, res, next) => {
  res.send("Server is up");
});

router.get("/", async (req, res, next) => {
  const tableList = await Table.find({});
  res.json(tableList);
});

router.get("/:name", async (req, res, next) => {
  const table = await Table.findOne({ name: req.params.name });
  if (!table) {
    console.log(`Table ${req.params.name} does not exist`);
    res.status(400).json({ message: "Table does not exist" });
    return;
  }

  res.json(table);
});

router.post("/", async (req, res, next) => {
  const table = await Table.findOne({ name: req.body.name });

  if (table) {
    if (table.name.toUpperCase() === req.body.name.trim().toUpperCase()) {
      console.log(`Table ${req.body.name} already exists`);
      res.status(400).json({ message: "Table name already exists" });
      return;
    }
  }

  const newTable = new Table(req.body);
  const savedTable = await newTable.save();
  res.json(savedTable);
});

router.delete("/:name", async (req, res, next) => {
  const table = await Table.findOne({ name: req.params.name });

  if (!table) {
    console.log(`Table ${req.params.name} does not exist`);
    res.status(400).json({ message: "Table does not exist" });
    return;
  }

  const deletedTable = await Table.deleteOne({ name: req.params.name });
  res.json(deletedTable);
});

router.put("/:name", async (req, res, next) => {
  const table = await Table.findOne({ name: req.params.name });
  if (!table) {
    console.log(`Table ${req.params.name} does not exist`);
    res.status(400).json({ message: "Table does not exist" });
    return;
  }

  const updatedTable = await Table.findOne({ name: req.body.name });

  if (updatedTable && updatedTable.name != req.params.name) {
    if (
      updatedTable.name.toUpperCase() === req.body.name.trim().toUpperCase()
    ) {
      console.log(`Table ${req.body.name} already exists`);
      res.status(400).json({ message: "Table name already exists" });
      return;
    }
  }

  table.name = req.body.name;
  table.description = req.body.description;

  const savedTable = await table.save();

  res.json(savedTable);
});

module.exports = router;

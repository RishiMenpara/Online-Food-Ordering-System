const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all menu items with restaurant name (JOIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Menu_Item.*, Restaurant.RestName
      FROM Menu_Item
      JOIN Restaurant ON Menu_Item.RestaurantID = Restaurant.RestaurantID
      ORDER BY Price DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET items above average price (subquery)
router.get('/expensive', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM Menu_Item
      WHERE Price > (SELECT AVG(Price) FROM Menu_Item)`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET items NOT in any order (subquery)
router.get('/unordered', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ItemName FROM Menu_Item
      WHERE ItemID NOT IN (SELECT ItemID FROM Order_Item)`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET avg price per category (GROUP BY)
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Category, AVG(Price) AS AvgPrice, COUNT(*) AS ItemCount
      FROM Menu_Item GROUP BY Category ORDER BY AvgPrice DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET most ordered item
router.get('/topitem', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Menu_Item.ItemName, SUM(Order_Item.Quantity) AS TotalOrdered
      FROM Order_Item
      JOIN Menu_Item ON Order_Item.ItemID = Menu_Item.ItemID
      GROUP BY Order_Item.ItemID
      ORDER BY TotalOrdered DESC LIMIT 1`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST - add menu item (Check_Price trigger fires in MySQL)
router.post('/', async (req, res) => {
  try {
    const { ItemID, ItemName, Price, Category, RestaurantID } = req.body;
    await db.query(
      'INSERT INTO Menu_Item VALUES (?, ?, ?, ?, ?)',
      [ItemID, ItemName, Price, Category, RestaurantID]
    );
    res.json({ success: true, message: 'Menu item added!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE - remove menu item
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Menu_Item WHERE ItemID=?', [req.params.id]);
    res.json({ success: true, message: 'Item deleted!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

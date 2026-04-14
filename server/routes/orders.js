const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all orders with customer + restaurant (3-table JOIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Orders.OrderID, Orders.OrderDate, Orders.TotalAmount,
             Customer.Name AS CustomerName,
             Restaurant.RestName AS RestaurantName
      FROM Orders
      JOIN Customer ON Orders.CustomerID = Customer.CustomerID
      JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID
      ORDER BY Orders.OrderDate DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET order items detail (JOIN Menu_Item with Order_Item)
router.get('/items', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Orders.OrderID, Customer.Name AS CustomerName,
             Menu_Item.ItemName, Order_Item.Quantity, Order_Item.SubTotal
      FROM Order_Item
      JOIN Orders ON Order_Item.OrderID = Orders.OrderID
      JOIN Menu_Item ON Order_Item.ItemID = Menu_Item.ItemID
      JOIN Customer ON Orders.CustomerID = Customer.CustomerID
      ORDER BY Orders.OrderID`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET high value orders VIEW
router.get('/highvalue', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Orders.OrderID, Orders.TotalAmount, Orders.OrderDate,
             Customer.Name AS CustomerName
      FROM Orders
      JOIN Customer ON Orders.CustomerID = Customer.CustomerID
      WHERE Orders.TotalAmount > 400
      ORDER BY Orders.TotalAmount DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET orders between amount range
router.get('/range', async (req, res) => {
  try {
    const { min = 0, max = 99999 } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM Orders WHERE TotalAmount BETWEEN ? AND ? ORDER BY TotalAmount',
      [min, max]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET order stats per customer
router.get('/customerstats', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Customer.Name, COUNT(Orders.OrderID) AS OrderCount,
             SUM(Orders.TotalAmount) AS TotalSpent
      FROM Orders
      JOIN Customer ON Orders.CustomerID = Customer.CustomerID
      GROUP BY Orders.CustomerID
      ORDER BY TotalSpent DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET orders without delivery (subquery)
router.get('/nodelivery', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT OrderID FROM Orders
      WHERE OrderID NOT IN (SELECT OrderID FROM Delivery)`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

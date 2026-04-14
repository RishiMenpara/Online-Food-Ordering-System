const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM Restaurant ORDER BY RestName';
    let params = [];
    if (city) {
      query = 'SELECT * FROM Restaurant WHERE Location = ? ORDER BY RestName';
      params = [city];
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET distinct cities
router.get('/cities', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT Location FROM Restaurant');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET restaurants that have menu items (subquery)
router.get('/withmenu', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT RestName FROM Restaurant
      WHERE RestaurantID IN (SELECT RestaurantID FROM Menu_Item)`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET order counts per restaurant
router.get('/orderstats', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Restaurant.RestName, COUNT(Orders.OrderID) AS TotalOrders,
             SUM(Orders.TotalAmount) AS Revenue
      FROM Orders
      JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID
      GROUP BY Restaurant.RestName
      ORDER BY Revenue DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST - add restaurant
router.post('/', async (req, res) => {
  try {
    const { RestaurantID, RestName, Location, Phone } = req.body;
    await db.query('INSERT INTO Restaurant VALUES (?, ?, ?, ?)', [RestaurantID, RestName, Location, Phone]);
    res.json({ success: true, message: 'Restaurant added!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

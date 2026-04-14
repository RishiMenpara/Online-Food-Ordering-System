const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Customer ORDER BY CustomerID');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET customers who have placed orders (subquery)
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Name FROM Customer
      WHERE CustomerID IN (SELECT CustomerID FROM Orders)`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET customers who spent above avg (subquery)
router.get('/highspenders', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT Customer.Name FROM Customer
      JOIN Orders ON Customer.CustomerID = Orders.CustomerID
      WHERE Orders.TotalAmount > (SELECT AVG(TotalAmount) FROM Orders)`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST - add new customer
router.post('/', async (req, res) => {
  try {
    const { CustomerID, Name, Phone, Email, Address } = req.body;
    await db.query(
      'INSERT INTO Customer VALUES (?, ?, ?, ?, ?)',
      [CustomerID, Name, Phone, Email, Address]
    );
    res.json({ success: true, message: 'Customer added successfully!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT - update customer phone
router.put('/:id', async (req, res) => {
  try {
    const { Phone, Address } = req.body;
    await db.query(
      'UPDATE Customer SET Phone=?, Address=? WHERE CustomerID=?',
      [Phone, Address, req.params.id]
    );
    res.json({ success: true, message: 'Customer updated successfully!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE - remove customer
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Customer WHERE CustomerID=?', [req.params.id]);
    res.json({ success: true, message: 'Customer deleted successfully!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

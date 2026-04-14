const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all payments with customer name (3-table JOIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Payment.PaymentID, Payment.PaymentMethod, Payment.PaymentStatus,
             Payment.AmountPaid, Customer.Name AS CustomerName,
             Orders.OrderDate
      FROM Payment
      JOIN Orders ON Payment.OrderID = Orders.OrderID
      JOIN Customer ON Orders.CustomerID = Customer.CustomerID
      ORDER BY Payment.PaymentID`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET payment summary by method (GROUP BY)
router.get('/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT PaymentMethod,
             COUNT(*) AS TransactionCount,
             SUM(AmountPaid) AS TotalAmount
      FROM Payment
      GROUP BY PaymentMethod
      ORDER BY TotalAmount DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET orders + payment method (JOIN)
router.get('/orderpayment', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Orders.OrderID, Payment.PaymentMethod, Payment.AmountPaid
      FROM Orders
      JOIN Payment ON Orders.OrderID = Payment.OrderID`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

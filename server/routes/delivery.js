const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all deliveries with order + delivery person info (JOIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Delivery.DeliveryID, Delivery.DeliveryStatus, Delivery.DeliveryTime,
             Orders.OrderDate, Customer.Name AS CustomerName,
             Delivery_Person.DPName AS DeliveryPersonName,
             Delivery_Person.DPPhone
      FROM Delivery
      JOIN Orders ON Delivery.OrderID = Orders.OrderID
      JOIN Customer ON Orders.CustomerID = Customer.CustomerID
      JOIN Delivery_Person ON Delivery.DeliveryPersonID = Delivery_Person.DeliveryPersonID
      ORDER BY Delivery.DeliveryID`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET late deliveries (after 14:00)
router.get('/late', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Delivery.*, Delivery_Person.DPName
      FROM Delivery
      JOIN Delivery_Person ON Delivery.DeliveryPersonID = Delivery_Person.DeliveryPersonID
      WHERE Delivery.DeliveryTime > '14:00:00'`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT - update delivery status
router.put('/:id', async (req, res) => {
  try {
    const { DeliveryStatus } = req.body;
    await db.query(
      'UPDATE Delivery SET DeliveryStatus=? WHERE DeliveryID=?',
      [DeliveryStatus, req.params.id]
    );
    res.json({ success: true, message: 'Delivery status updated!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

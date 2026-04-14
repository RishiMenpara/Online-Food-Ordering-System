const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all delivery persons
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Delivery_Person.*,
             COUNT(Delivery.DeliveryID) AS TotalDeliveries
      FROM Delivery_Person
      LEFT JOIN Delivery ON Delivery_Person.DeliveryPersonID = Delivery.DeliveryPersonID
      GROUP BY Delivery_Person.DeliveryPersonID
      ORDER BY TotalDeliveries DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST - add delivery person
router.post('/', async (req, res) => {
  try {
    const { DeliveryPersonID, DPName, DPPhone } = req.body;
    await db.query(
      'INSERT INTO Delivery_Person VALUES (?, ?, ?)',
      [DeliveryPersonID, DPName, DPPhone]
    );
    res.json({ success: true, message: 'Delivery person added!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE - remove delivery person
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Delivery_Person WHERE DeliveryPersonID=?', [req.params.id]);
    res.json({ success: true, message: 'Delivery person removed!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

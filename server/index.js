require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/delivery-persons', require('./routes/delivery_person'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/queries', require('./routes/queries'));

// Dashboard stats
const db = require('./db');
app.get('/api/dashboard', async (req, res) => {
  try {
    const [[customers]] = await db.query('SELECT COUNT(*) AS total FROM Customer');
    const [[restaurants]] = await db.query('SELECT COUNT(*) AS total FROM Restaurant');
    const [[orders]] = await db.query('SELECT COUNT(*) AS total FROM Orders');
    const [[revenue]] = await db.query('SELECT SUM(TotalAmount) AS total FROM Orders');
    const [[avgOrder]] = await db.query('SELECT AVG(TotalAmount) AS total FROM Orders');
    const [[maxOrder]] = await db.query('SELECT MAX(TotalAmount) AS total FROM Orders');
    const [revenueByRest] = await db.query(`
      SELECT Restaurant.RestName, SUM(Orders.TotalAmount) AS Revenue
      FROM Orders JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID
      GROUP BY Restaurant.RestName ORDER BY Revenue DESC LIMIT 5`);
    const [paymentMethods] = await db.query(`
      SELECT PaymentMethod, SUM(AmountPaid) AS Total
      FROM Payment GROUP BY PaymentMethod`);
    res.json({
      totalCustomers: customers.total,
      totalRestaurants: restaurants.total,
      totalOrders: orders.total,
      totalRevenue: revenue.total || 0,
      avgOrder: avgOrder.total || 0,
      maxOrder: maxOrder.total || 0,
      revenueByRestaurant: revenueByRest,
      paymentMethods
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ FOS Server running on http://localhost:${PORT}`));

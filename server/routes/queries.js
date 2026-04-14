const express = require('express');
const router = express.Router();
const db = require('../db');

const queries = {
  // DML
  dml: [
    { label: 'All Customers', sql: 'SELECT * FROM Customer' },
    { label: 'All Restaurants', sql: 'SELECT * FROM Restaurant' },
    { label: 'All Menu Items', sql: 'SELECT * FROM Menu_Item' },
    { label: 'All Orders', sql: 'SELECT * FROM Orders' },
    { label: 'All Order Items', sql: 'SELECT * FROM Order_Item' },
    { label: 'All Payments', sql: 'SELECT * FROM Payment' },
    { label: 'All Delivery Persons', sql: 'SELECT * FROM Delivery_Person' },
    { label: 'All Deliveries', sql: 'SELECT * FROM Delivery' },
  ],
  // DQL - Basic
  dql: [
    { label: 'Customer Names Only', sql: 'SELECT Name FROM Customer' },
    { label: 'Orders > ₹300', sql: 'SELECT * FROM Orders WHERE TotalAmount > 300' },
    { label: 'Restaurants Ordered by Name', sql: 'SELECT * FROM Restaurant ORDER BY RestName' },
    { label: 'Menu Items > ₹200', sql: 'SELECT * FROM Menu_Item WHERE Price > 200' },
    { label: 'Orders BETWEEN ₹200-₹600', sql: 'SELECT * FROM Orders WHERE TotalAmount BETWEEN 200 AND 600' },
    { label: 'Gmail Customers', sql: "SELECT * FROM Customer WHERE Email LIKE '%gmail.com'" },
    { label: 'Customers in Ahmedabad', sql: "SELECT * FROM Customer WHERE Address LIKE '%Ahmedabad%'" },
    { label: 'Restaurants Starting with P', sql: "SELECT * FROM Restaurant WHERE RestName LIKE 'P%'" },
    { label: 'Distinct Cities', sql: 'SELECT DISTINCT Location FROM Restaurant' },
    { label: 'Menu Items Sorted by Price DESC', sql: 'SELECT * FROM Menu_Item ORDER BY Price DESC' },
    { label: 'Customers Sorted by Name', sql: 'SELECT * FROM Customer ORDER BY Name ASC' },
    { label: 'Orders Sorted by Date DESC', sql: 'SELECT * FROM Orders ORDER BY OrderDate DESC' },
    { label: 'Delivery After 14:00', sql: "SELECT * FROM Delivery WHERE DeliveryTime > '14:00:00'" },
    { label: 'Ahmedabad Restaurants', sql: "SELECT * FROM Restaurant WHERE Location = 'Ahmedabad'" },
  ],
  // Aggregate
  aggregate: [
    { label: 'Count Customers', sql: 'SELECT COUNT(*) AS TotalCustomers FROM Customer' },
    { label: 'Max Menu Price', sql: 'SELECT MAX(Price) AS MaxPrice FROM Menu_Item' },
    { label: 'Min Menu Price', sql: 'SELECT MIN(Price) AS MinPrice FROM Menu_Item' },
    { label: 'Avg Menu Price', sql: 'SELECT AVG(Price) AS AvgPrice FROM Menu_Item' },
    { label: 'Count Orders', sql: 'SELECT COUNT(OrderID) AS TotalOrders FROM Orders' },
    { label: 'Total Revenue', sql: 'SELECT SUM(TotalAmount) AS TotalRevenue FROM Orders' },
    { label: 'Avg Order Value', sql: 'SELECT AVG(TotalAmount) AS AvgOrder FROM Orders' },
    { label: 'Max Order', sql: 'SELECT MAX(TotalAmount) AS MaxOrder FROM Orders' },
    { label: 'Min Order', sql: 'SELECT MIN(TotalAmount) AS MinOrder FROM Orders' },
    { label: 'Orders Per Customer', sql: 'SELECT CustomerID, COUNT(OrderID) AS OrderCount FROM Orders GROUP BY CustomerID' },
    { label: 'Revenue by Restaurant', sql: 'SELECT Restaurant.RestName, SUM(Orders.TotalAmount) AS Revenue FROM Orders JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID GROUP BY Restaurant.RestName' },
    { label: 'Orders Per Restaurant', sql: 'SELECT Restaurant.RestName, COUNT(Orders.OrderID) AS TotalOrders FROM Orders JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID GROUP BY Restaurant.RestName' },
    { label: 'Avg Price Per Category', sql: 'SELECT Category, AVG(Price) AS AvgPrice FROM Menu_Item GROUP BY Category' },
    { label: 'Payment Method Totals', sql: 'SELECT PaymentMethod, SUM(AmountPaid) AS TotalAmount FROM Payment GROUP BY PaymentMethod' },
    { label: 'Qty Per Item (Order_Item)', sql: 'SELECT ItemID, SUM(Quantity) AS TotalQuantity FROM Order_Item GROUP BY ItemID' },
    { label: 'Customers with Multiple Orders (HAVING)', sql: 'SELECT CustomerID, COUNT(OrderID) AS OrderCount FROM Orders GROUP BY CustomerID HAVING COUNT(OrderID) > 1' },
    { label: 'Orders with Total Qty > 1 (HAVING)', sql: 'SELECT OrderID FROM Order_Item GROUP BY OrderID HAVING SUM(Quantity) > 1' },
  ],
  // JOINs
  joins: [
    { label: 'Customer + Order ID (INNER JOIN)', sql: 'SELECT Customer.Name, Orders.OrderID FROM Customer JOIN Orders ON Customer.CustomerID = Orders.CustomerID' },
    { label: 'Order + Restaurant (INNER JOIN)', sql: 'SELECT Orders.OrderID, Restaurant.RestName FROM Orders JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID' },
    { label: 'Menu Item + Restaurant (INNER JOIN)', sql: 'SELECT Menu_Item.ItemName, Restaurant.RestName FROM Menu_Item JOIN Restaurant ON Menu_Item.RestaurantID = Restaurant.RestaurantID' },
    { label: 'Customer + Order ID (LEFT JOIN)', sql: 'SELECT Customer.Name, Orders.OrderID FROM Customer LEFT JOIN Orders ON Customer.CustomerID = Orders.CustomerID' },
    { label: 'Customer + Order ID (RIGHT JOIN)', sql: 'SELECT Customer.Name, Orders.OrderID FROM Customer RIGHT JOIN Orders ON Customer.CustomerID = Orders.CustomerID' },
    { label: 'Order + Payment Method (JOIN)', sql: 'SELECT Orders.OrderID, Payment.PaymentMethod, Payment.AmountPaid FROM Orders JOIN Payment ON Orders.OrderID = Payment.OrderID' },
    { label: 'Customer + Restaurant + Order (3-Table JOIN)', sql: 'SELECT Customer.Name, Restaurant.RestName, Orders.TotalAmount FROM Orders JOIN Customer ON Orders.CustomerID = Customer.CustomerID JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID' },
    { label: 'Customer + Payment (3-Table JOIN)', sql: 'SELECT Customer.Name, Payment.AmountPaid, Payment.PaymentMethod FROM Payment JOIN Orders ON Payment.OrderID = Orders.OrderID JOIN Customer ON Orders.CustomerID = Customer.CustomerID' },
    { label: 'Order + Delivery Status', sql: 'SELECT Orders.OrderID, Delivery.DeliveryStatus FROM Orders JOIN Delivery ON Orders.OrderID = Delivery.OrderID' },
    { label: 'Item + Order Quantity', sql: 'SELECT Menu_Item.ItemName, Order_Item.Quantity FROM Order_Item JOIN Menu_Item ON Order_Item.ItemID = Menu_Item.ItemID' },
    { label: 'Customer + Order (Full Detail)', sql: 'SELECT Customer.Name, Orders.OrderID, Orders.TotalAmount FROM Customer JOIN Orders ON Customer.CustomerID = Orders.CustomerID' },
    { label: 'Order + Customer + Restaurant', sql: 'SELECT Orders.OrderID, Customer.Name, Restaurant.RestName FROM Orders JOIN Customer ON Orders.CustomerID = Customer.CustomerID JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID' },
  ],
  // Subqueries
  subqueries: [
    { label: 'Items Above Avg Price', sql: 'SELECT * FROM Menu_Item WHERE Price > (SELECT AVG(Price) FROM Menu_Item)' },
    { label: 'Customers Who Ordered', sql: 'SELECT Name FROM Customer WHERE CustomerID IN (SELECT CustomerID FROM Orders)' },
    { label: 'Customers Who Never Ordered', sql: 'SELECT Name FROM Customer WHERE CustomerID NOT IN (SELECT CustomerID FROM Orders)' },
    { label: 'Restaurants With Menu Items', sql: 'SELECT RestName FROM Restaurant WHERE RestaurantID IN (SELECT RestaurantID FROM Menu_Item)' },
    { label: 'Max Order Record', sql: 'SELECT * FROM Orders WHERE TotalAmount = (SELECT MAX(TotalAmount) FROM Orders)' },
    { label: 'Min Order Record', sql: 'SELECT * FROM Orders WHERE TotalAmount = (SELECT MIN(TotalAmount) FROM Orders)' },
    { label: 'Items Never Ordered', sql: 'SELECT ItemName FROM Menu_Item WHERE ItemID NOT IN (SELECT ItemID FROM Order_Item)' },
    { label: 'Orders Without Delivery', sql: 'SELECT OrderID FROM Orders WHERE OrderID NOT IN (SELECT OrderID FROM Delivery)' },
    { label: 'Customers Spent Above Avg', sql: 'SELECT DISTINCT Customer.Name FROM Customer JOIN Orders ON Customer.CustomerID = Orders.CustomerID WHERE Orders.TotalAmount > (SELECT AVG(TotalAmount) FROM Orders)' },
    { label: 'Top Ordered Item', sql: 'SELECT ItemID, SUM(Quantity) AS TotalQuantity FROM Order_Item GROUP BY ItemID ORDER BY TotalQuantity DESC LIMIT 1' },
    { label: 'Customers Ordered in Ahmedabad', sql: "SELECT DISTINCT Customer.Name FROM Customer JOIN Orders ON Customer.CustomerID = Orders.CustomerID JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID WHERE Restaurant.Location = 'Ahmedabad'" },
  ],
  // Views
  views: [
    { label: 'High Value Orders (> ₹400)', sql: 'SELECT * FROM Orders WHERE TotalAmount > 400' },
    { label: 'Customer + Order + Total', sql: 'SELECT Customer.Name, Orders.OrderID, Orders.TotalAmount FROM Customer JOIN Orders ON Customer.CustomerID = Orders.CustomerID' },
    { label: 'Customer + Payment View', sql: 'SELECT Customer.Name, Payment.AmountPaid, Payment.PaymentMethod FROM Customer JOIN Orders ON Customer.CustomerID = Orders.CustomerID JOIN Payment ON Orders.OrderID = Payment.OrderID' },
  ],
};

// GET list of all query categories
router.get('/categories', (req, res) => {
  res.json(Object.keys(queries).map(k => ({ key: k, count: queries[k].length })));
});

// GET queries by category
router.get('/:category', (req, res) => {
  const cat = req.params.category;
  if (!queries[cat]) return res.status(404).json({ error: 'Category not found' });
  res.json(queries[cat]);
});

// POST - execute a specific query
router.post('/run', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'No SQL provided' });
    const [rows] = await db.query(sql);
    res.json({ rows, count: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

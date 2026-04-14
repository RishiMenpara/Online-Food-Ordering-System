use FOS;

-- DML

INSERT INTO Customer
VALUES (1,'Rahul Patel','9876543210','rahul@gmail.com','Ahmedabad');

INSERT INTO Restaurant
VALUES (101,'Pizza Palace','Ahmedabad','9871112222');

INSERT INTO Menu_Item
VALUES (201,'Margherita Pizza',250,'Pizza',101);

INSERT INTO CustomerOrders
VALUES (301,'2026-03-10',500,1,101);

UPDATE Customer
SET Phone='9999999999'
WHERE CustomerID=1;

UPDATE Menu_Item
SET Price=300
WHERE ItemID=201;

DELETE FROM Menu_Item
WHERE ItemID=201;

DELETE FROM Customer
WHERE CustomerID=3;

-- DQL

SELECT * FROM Customer;

SELECT Name FROM Customer;

SELECT * FROM CustomerOrders
WHERE TotalAmount > 300;

SELECT * FROM Restaurant
ORDER BY RestName;

SELECT COUNT(*) FROM Customer;

SELECT MAX(Price) FROM Menu_Item;

SELECT MIN(Price) FROM Menu_Item;

SELECT AVG(Price) FROM Menu_Item; 


-- JOin Queries

SELECT Customer.Name, CustomerOrders.OrderID
FROM Customer
JOIN CustomerOrders
ON Customer.CustomerID = CustomerOrders.CustomerID;

SELECT CustomerOrders.OrderID, Restaurant.RestName
FROM CustomerOrders
JOIN Restaurant
ON CustomerOrders.RestaurantID = Restaurant.RestaurantID;

SELECT Menu_Item.ItemName, Restaurant.RestName
FROM Menu_Item
JOIN Restaurant
ON Menu_Item.RestaurantID = Restaurant.RestaurantID;


SELECT Customer.Name, CustomerOrders.OrderID
FROM Customer
LEFT JOIN CustomerOrders
ON Customer.CustomerID = CustomerOrders.CustomerID;


SELECT Customer.Name, CustomerOrders.OrderID
FROM Customer
RIGHT JOIN CustomerOrders
ON Customer.CustomerID = CustomerOrders.CustomerID;

-- View Queries

CREATE VIEW CustomerOrderView AS
SELECT Customer.Name, CustomerOrders.OrderID, CustomerOrders.TotalAmount
FROM Customer
JOIN CustomerOrders
ON Customer.CustomerID = CustomerOrders.CustomerID;

SELECT * FROM CustomerOrderView;

DROP VIEW CustomerOrderView;

-- TCL (Transaction Control Language)

START TRANSACTION; 

COMMIT;

ROLLBACK;

-- new queries

SELECT * FROM Customer
WHERE Address LIKE '%Ahmedabad%';

SELECT * FROM Restaurant
WHERE Location = 'Ahmedabad';

SELECT * FROM Menu_Item
WHERE Price > 200;

SELECT * FROM Orders
WHERE TotalAmount BETWEEN 200 AND 600;

SELECT * FROM Customer
WHERE Email LIKE '%gmail.com';

-- 

SELECT * FROM Restaurant
WHERE RestName LIKE 'P%';

SELECT DISTINCT Location
FROM Restaurant;

SELECT COUNT(OrderID) AS TotalOrders
FROM Orders;

SELECT SUM(TotalAmount) AS TotalRevenue
FROM Orders;

SELECT AVG(TotalAmount)
FROM Orders;

SELECT MAX(TotalAmount)
FROM Orders;

SELECT MIN(TotalAmount)
FROM Orders;

SELECT * FROM Menu_Item
ORDER BY Price DESC;

SELECT * FROM Customer
ORDER BY Name ASC;

SELECT CustomerID, COUNT(OrderID) AS OrderCount
FROM Orders
GROUP BY CustomerID;

-- 41

SELECT CustomerID, COUNT(OrderID) AS OrderCount
FROM Orders
GROUP BY CustomerID
HAVING COUNT(OrderID) > 1;

SELECT * FROM Menu_Item
WHERE Price > (
    SELECT AVG(Price)
    FROM Menu_Item
);

SELECT Name
FROM Customer
WHERE CustomerID IN (
    SELECT CustomerID
    FROM Orders
);

SELECT RestName
FROM Restaurant
WHERE RestaurantID IN (
    SELECT RestaurantID
    FROM Menu_Item
);

SELECT Orders.OrderID, Payment.PaymentMethod, Payment.AmountPaid
FROM Orders
JOIN Payment
ON Orders.OrderID = Payment.OrderID; 

-- 46

CREATE VIEW HighValueOrders AS
SELECT * FROM Orders
WHERE TotalAmount > 400; 

SELECT * FROM HighValueOrders;

CREATE VIEW CustomerPaymentView AS
SELECT Customer.Name, Payment.AmountPaid, Payment.PaymentMethod
FROM Customer
JOIN Orders ON Customer.CustomerID = Orders.CustomerID
JOIN Payment ON Orders.OrderID = Payment.OrderID;

SELECT * FROM CustomerPaymentView;

DELIMITER //

CREATE TRIGGER Check_Price
BEFORE INSERT ON Menu_Item
FOR EACH ROW
BEGIN
    IF NEW.Price <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Price must be greater than 0';
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER Check_Quantity
BEFORE INSERT ON Order_Item
FOR EACH ROW
BEGIN
    IF NEW.Quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Quantity must be greater than 0';
    END IF;
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER Update_Total
AFTER INSERT ON Order_Item
FOR EACH ROW
BEGIN
    UPDATE Orders
    SET TotalAmount = TotalAmount + NEW.SubTotal
    WHERE OrderID = NEW.OrderID;
END;
//

DELIMITER ;

TRUNCATE TABLE Delivery;

DROP VIEW HighValueOrders;

SELECT Customer.Name, Restaurant.RestName, Orders.TotalAmount
FROM Orders
JOIN Customer ON Orders.CustomerID = Customer.CustomerID
JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID;

-- 56 

SELECT Customer.Name, Orders.OrderID, Orders.TotalAmount
FROM Customer
JOIN Orders ON Customer.CustomerID = Orders.CustomerID;

SELECT Restaurant.RestName, COUNT(Orders.OrderID) AS TotalOrders
FROM Orders
JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID
GROUP BY Restaurant.RestName;

SELECT Restaurant.RestName, SUM(Orders.TotalAmount) AS Revenue
FROM Orders
JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID
GROUP BY Restaurant.RestName;

SELECT Orders.OrderID, Delivery.DeliveryStatus
FROM Orders
JOIN Delivery ON Orders.OrderID = Delivery.OrderID;

SELECT Customer.Name, Payment.PaymentMethod, Payment.AmountPaid
FROM Payment
JOIN Orders ON Payment.OrderID = Orders.OrderID
JOIN Customer ON Orders.CustomerID = Customer.CustomerID;

SELECT Menu_Item.ItemName, Order_Item.Quantity
FROM Order_Item
JOIN Menu_Item ON Order_Item.ItemID = Menu_Item.ItemID;

SELECT OrderID, TotalAmount
FROM Orders
WHERE TotalAmount > 300;

SELECT Name
FROM Customer
WHERE CustomerID NOT IN (
    SELECT CustomerID FROM Orders
);

SELECT * FROM Orders
WHERE TotalAmount = (SELECT MAX(TotalAmount) FROM Orders);

SELECT * FROM Orders
WHERE TotalAmount = (SELECT MIN(TotalAmount) FROM Orders);

SELECT Category, AVG(Price) AS AvgPrice
FROM Menu_Item
GROUP BY Category;

UPDATE Delivery
SET DeliveryStatus = 'Completed'
WHERE DeliveryID = 501;

DELETE FROM Payment
WHERE PaymentID = 410;

SELECT * FROM Orders
ORDER BY OrderDate DESC;

-- 71

SELECT Orders.OrderID, Customer.Name, Restaurant.RestName
FROM Orders
JOIN Customer ON Orders.CustomerID = Customer.CustomerID
JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID;

SELECT ItemID, SUM(Quantity) AS TotalQuantity
FROM Order_Item
GROUP BY ItemID;

SELECT ItemID, SUM(Quantity) AS TotalQuantity
FROM Order_Item
GROUP BY ItemID
ORDER BY TotalQuantity DESC
LIMIT 1;

SELECT OrderID
FROM Order_Item
GROUP BY OrderID
HAVING SUM(Quantity) > 1;

SELECT DISTINCT Customer.Name
FROM Customer
JOIN Orders ON Customer.CustomerID = Orders.CustomerID
JOIN Restaurant ON Orders.RestaurantID = Restaurant.RestaurantID
WHERE Restaurant.Location = 'Ahmedabad';

SELECT ItemName
FROM Menu_Item
WHERE ItemID NOT IN (
    SELECT ItemID FROM Order_Item
);

SELECT OrderID
FROM Orders
WHERE OrderID NOT IN (
    SELECT OrderID FROM Delivery
);

SELECT DISTINCT Customer.Name
FROM Customer
JOIN Orders ON Customer.CustomerID = Orders.CustomerID
WHERE Orders.TotalAmount > (
    SELECT AVG(TotalAmount) FROM Orders
);

SELECT PaymentMethod, SUM(AmountPaid) AS TotalAmount
FROM Payment
GROUP BY PaymentMethod;

SELECT * FROM Delivery
WHERE DeliveryTime > '14:00:00';
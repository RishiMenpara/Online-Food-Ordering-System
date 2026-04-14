create database if not exists FOS;
use FOS;

CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Address VARCHAR(255)
);

CREATE TABLE Restaurant (
    RestaurantID INT PRIMARY KEY,
    RestName VARCHAR(100) NOT NULL,
    Location VARCHAR(150),
    Phone VARCHAR(15)
);

CREATE TABLE Menu_Item (
    ItemID INT PRIMARY KEY,
    ItemName VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Category VARCHAR(50),
    RestaurantID INT,
    FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID)
);

CREATE TABLE Orders (
    OrderID INT PRIMARY KEY,
    OrderDate DATE,
    TotalAmount DECIMAL(10,2),
    CustomerID INT,
    RestaurantID INT,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID)
);

CREATE TABLE Order_Item (
    OrderID INT,
    ItemID INT,
    Quantity INT,
    SubTotal DECIMAL(10,2),
    PRIMARY KEY (OrderID, ItemID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ItemID) REFERENCES Menu_Item(ItemID)
);

CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY,
    PaymentMethod VARCHAR(50),
    PaymentStatus VARCHAR(30),
    AmountPaid DECIMAL(10,2),
    OrderID INT UNIQUE,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);

CREATE TABLE Delivery_Person (
    DeliveryPersonID INT PRIMARY KEY,
    DPName VARCHAR(100),
    DPPhone VARCHAR(15)
);

CREATE TABLE Delivery (
    DeliveryID INT PRIMARY KEY,
    DeliveryStatus VARCHAR(30),
    DeliveryTime TIME,
    OrderID INT UNIQUE,
    DeliveryPersonID INT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (DeliveryPersonID) REFERENCES Delivery_Person(DeliveryPersonID)
);


INSERT INTO Customer VALUES
(2,'Amit Shah','9876543211','amit@gmail.com','Surat'),
(3,'Neha Sharma','9876543212','neha@gmail.com','Vadodara'),
(4,'Priya Singh','9876543213','priya@gmail.com','Rajkot'),
(5,'Rohan Mehta','9876543214','rohan@gmail.com','Ahmedabad'),
(6,'Karan Desai','9876543215','karan@gmail.com','Surat'),
(7,'Sneha Patel','9876543216','sneha@gmail.com','Vadodara'),
(8,'Ankit Jain','9876543217','ankit@gmail.com','Rajkot'),
(9,'Pooja Verma','9876543218','pooja@gmail.com','Ahmedabad'),
(10,'Vikas Gupta','9876543219','vikas@gmail.com','Surat');


INSERT INTO Restaurant VALUES
(102,'Burger Hub','Surat','9991110002'),
(103,'Tandoori Treat','Vadodara','9991110003'),
(104,'Chinese Corner','Rajkot','9991110004'),
(105,'South Spice','Ahmedabad','9991110005'),
(106,'Food Junction','Surat','9991110006'),
(107,'Royal Bites','Vadodara','9991110007'),
(108,'Street Feast','Rajkot','9991110008'),
(109,'Urban Kitchen','Ahmedabad','9991110009'),
(110,'Spice Villa','Surat','9991110010');

INSERT INTO Delivery_Person VALUES
(1,'Rakesh','9000000001'),
(2,'Mahesh','9000000002'),
(3,'Suresh','9000000003'),
(4,'Dinesh','9000000004'),
(5,'Naresh','9000000005'),
(6,'Rajesh','9000000006'),
(7,'Mukesh','9000000007'),
(8,'Paresh','9000000008'),
(9,'Hitesh','9000000009'),
(10,'Yogesh','9000000010');


INSERT INTO Menu_Item VALUES
(201,'Margherita Pizza',250,'Pizza',101),
(202,'Veg Burger',120,'Burger',102),
(203,'Paneer Tikka',300,'Starter',103),
(204,'Hakka Noodles',220,'Chinese',104),
(205,'Masala Dosa',150,'South Indian',105),
(206,'Chicken Biryani',350,'Biryani',106),
(207,'Veg Sandwich',100,'Fast Food',107),
(208,'Manchurian',200,'Chinese',108),
(209,'Pasta',270,'Italian',109),
(210,'Dal Makhani',240,'Indian',110);


INSERT INTO Orders VALUES
(301,'2026-03-10',500,1,101),
(302,'2026-03-11',300,2,102),
(303,'2026-03-12',450,3,103),
(304,'2026-03-13',350,4,104),
(305,'2026-03-14',200,5,105),
(306,'2026-03-15',600,6,106),
(307,'2026-03-16',250,7,107),
(308,'2026-03-17',400,8,108),
(309,'2026-03-18',320,9,109),
(310,'2026-03-19',280,10,110);


INSERT INTO Order_Item VALUES
(301,201,2,500),
(302,202,2,240),
(303,203,1,300),
(304,204,2,440),
(305,205,1,150),
(306,206,2,700),
(307,207,2,200),
(308,208,2,400),
(309,209,1,270),
(310,210,1,240);

INSERT INTO Payment VALUES
(401,'UPI','Paid',500,301),
(402,'Card','Paid',300,302),
(403,'Cash','Paid',450,303),
(404,'UPI','Paid',350,304),
(405,'Card','Paid',200,305),
(406,'UPI','Paid',600,306),
(407,'Cash','Paid',250,307),
(408,'UPI','Paid',400,308),
(409,'Card','Paid',320,309),
(410,'Cash','Paid',280,310);

INSERT INTO Delivery VALUES
(501,'Delivered','12:30:00',301,1),
(502,'Delivered','13:00:00',302,2),
(503,'Delivered','13:30:00',303,3),
(504,'Delivered','14:00:00',304,4),
(505,'Delivered','14:30:00',305,5),
(506,'Delivered','15:00:00',306,6),
(507,'Delivered','15:30:00',307,7),
(508,'Delivered','16:00:00',308,8),
(509,'Delivered','16:30:00',309,9),
(510,'Delivered','17:00:00',310,10);


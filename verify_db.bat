@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h mysql-30899ec4-reesheemenpara1-0c66.e.aivencloud.com -P 21160 -u avnadmin -pAVNS_4KLa0aYT16G__JCbwPe --ssl-mode=REQUIRED defaultdb -e "SHOW TABLES; SELECT COUNT(*) as Customers FROM Customer; SELECT COUNT(*) as Restaurants FROM Restaurant; SELECT COUNT(*) as Orders FROM Orders;"

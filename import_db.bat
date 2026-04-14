@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h mysql-30899ec4-reesheemenpara1-0c66.e.aivencloud.com -P 21160 -u avnadmin -pAVNS_4KLa0aYT16G__JCbwPe --ssl-mode=REQUIRED defaultdb < "e:\STUDY\Online Food Ordering System\food_ordering_system.sql"
echo Done! Exit code: %errorlevel%

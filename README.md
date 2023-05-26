# CN351_weak_website

## เว็บไซต์นี้เป็นเว็บไซต์ที่มีรายละเอียดดังนี้
- เป็นเว็บไซต์ที่ใช้ฐานข้อมูล MySQL
- มีการเก็บ session กะบ username ของผู้ใช้ใน database
- สามารถสร้าง user ได้ที่ปุ่ม register
- เมื่อมีการ login แล้วจะสามารถรู้ข้อมูลของ user นั้นๆ และสามารถดู ข้อมูลของ user อื่นๆได้จาก userid

## จุดอ่อน
- ไม่มีการตรวจสอบความปลอดภัยของ password
- sessionId เป็นการเพิ่มเลขขึ้นมาเรื่อยๆ
- สามารถใช้ SQLi ในการโจมตีเพื้อหาข้อมูล user อื่นๆได้

## การสร้าง database
```
CREATE DATABSE studentID;
USE studentID;
CREATE TABLE users ( `idusers` INT NOT NULL AUTO_INCREMENT, `username` VARCHAR(45) NOT NULL, `password` VARCHAR(45) NOT NULL, `age` INT NOT NULL, PRIMARY KEY (`idusers`));
CREATE TABLE sessions (`sessionId` VARCHAR(45) NOT NULL, `userId` INT NOT NULL, `username` VARCHAR(45) NOT NULL, `age` INT NOT NULL, PRIMARY KEY (`sessionId`));
```

หลังจากสร้าง database แล้วให้นำ path ของ MySQL, ชื่อของ database และ password ลงใน file index.js
```
const pool = mysql.createPool({
    host: 'localhost', // Replace with your MySQL server host
    user: 'root', // Replace with your MySQL username
    password: 'password', // Replace with your MySQL password
    database: 'yourdatabase', // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
```

## การแก้ไขจุดอ่อน
- ทำการ random generate password แทนที่จะให้ user สร้างเองเพื่อป้องกันการ bruteforce
- ทำการ random generate sessionId เพื่อให้ attacker นั้นยากที่จะคาดเดา
- ทำการตรวจสอบ input ของ user เมื่อทำการ query เพือป้องกัน SQLi

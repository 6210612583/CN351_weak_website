import express from "express";
import mysql from "mysql"

const app = express()

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!p0877249371',
    database: 'test1',
   /*  waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 */
})

app.get("/", (req, res) => {
    res.json("tets hello")
})

app.get("/user", (req,res) => {
    const q = "SELECT * FROM users"
    db.query(q, (err, data) => {
        if(err) return res.json(err)
        return res.json.data
    })
})

app.listen(8800, () => {
    console.log("Connect to backend!")
})


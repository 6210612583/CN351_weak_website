import express from "express";
//import mysql from "mysql"
import mysql from "mysql2"
import cookieParser from "cookie-parser"
import  fs, { createReadStream }  from 'fs'
//import  createReadSteam  from 'fs'
//import createReadStream  from ("fs");
import bodyParser from "body-parser"

const COOKIE_SECRET = "secret"

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: 'localhost', // Replace with your MySQL server host
    user: 'root', // Replace with your MySQL username
    password: '!p0877249371', // Replace with your MySQL password
    database: 'test1', // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

app.get("/", (req, res) => {
    createReadStream('index.html').pipe(res)
})

app.get('/users', (req, res) => {
    pool.query('SELECT * FROM users', (error, results) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error retrieving users');
      } else {
        res.json(results);
      }
    });
  });

// Register route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  
    pool.query(query, [username, password], (error, results) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error creating user');
      } else {
        res.status(200).send('User created successfully');
      }
    });
  });
  
  // Login route
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
    pool.query(query, [username, password], (error, results) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error logging in');
      } else {
        if (results.length > 0) {
          res.status(200).send('Login successful');
        } else {
          res.status(401).send('Invalid credentials');
        }
      }
    });
  });

app.listen(8800, () => {
    console.log("Connect to localhost:8800")
})


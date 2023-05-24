import express from "express";
import mysql from "mysql2"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

const app = express()

app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const pool = mysql.createPool({
    host: 'localhost', // Replace with your MySQL server host
    user: 'root', // Replace with your MySQL username
    password: '!p0877249371', // Replace with your MySQL password
    database: 'test1', // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Home
app.get("/", (req, res) => {
  
    const sessionId = req.cookies.sessionId; // Retrieve the session ID from the cookie

    if (!sessionId) {
        // Render the login form if the session ID is undefined
        res.send(`
          <h1>Login page</h1>
          <form action="/login" method="post">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Log In</button>
          </form>
          <h3>Register</h3>
          <button onclick="window.location.href='/register'">Register</button>
        `);
    } else {
        // Perform necessary operations with the session ID and MySQL
        res.redirect('/user')
    }
})

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

    pool.query(query, [username, password], (error, query_results) => {
        if (error) {
            console.error('Error executing query', error);
            res.status(500).send('Error logging in');
        } else {
            if (query_results.length > 0) {
                console.log(query_results)
                // Get the current maximum session ID from MySQL
                pool.query('SELECT MAX(sessionId) AS maxSessionId FROM sessions', (err, results) => {
                    if (err) {
                        console.error('Error retrieving max session ID from MySQL:', err);
                        return;
                    }
                    const maxSessionId = results[0].maxSessionId || 0;
                    const sessionId = maxSessionId + 1; // Increment the session ID
                    const userId = query_results[0].idusers
                    const name = query_results[0].username
                    const userage = query_results[0].age

                    console.log(userId, name, userage)
                    // Store the new session ID in MySQL
                    pool.query('INSERT INTO sessions (sessionId, userId, username, age) VALUES (?, ?, ?, ?)', [sessionId, userId, name, userage], (err) => {
                        if (err) {
                            console.error('Error storing session ID in MySQL:', err);
                            return;
                        }

                        // Store the session ID in the cookie
                        console.log("this is new session ID", sessionId)
                        res.cookie('sessionId', sessionId);
                        res.redirect('/user')

                    });
                });

            } else {
                res.status(401).send(`
                <h1>Invalid credentials</h1>
                <button onclick="window.location.href='/'">Go to Homepage</button>
                `);
            }
        }
    });

});

//user page is the page that show user already login and store on cookie
app.get('/user', (req, res) => {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
        // Query the users table to retrieve the user data
        pool.query('SELECT * FROM sessions WHERE sessionId = ?', [sessionId], (err, results) => {
            if (err) {
                console.error('Error retrieving user data from MySQL:', err);
                return;
            }

            if (results.length > 0) {
                // User data found in the users table
                req.userData = results[0]; // Add the user data to the request object
                console.log(results[0])
                res.send(`
                <h1>Login successful, your session ID is ${req.cookies.sessionId}</h1><br>
                <h3>Hello ${req.userData.username}</h3>
                <p>Your age is ${req.userData.age}</p>
                <form action="/logout" method="post">
                <button type="submit">Log Out</button>
                </form>
                <form action="/records" method="post">
                <input type="text" name="id" placeholder="id" required><br>
                <button type="submit">search</button>
                </form>
                `);
            }
        });

    } else {
        res.redirect('/')
    }

})

app.post("/records", (request, response) => {
    const data = request.body;
    console.log(data)
    const query = `SELECT * FROM users WHERE idusers = ${data.id}`;
    console.log("q", query)
    pool.query(query, (err, rows) => {
      if(err) throw err;
      response.json({data:rows});
    });
  });

app.post('/logout', (req, res) => {
    const sessionId = req.cookies.sessionId; // Retrieve the session ID from the cookie

    // Delete the session from the sessions table based on the sessionId
    pool.query('DELETE FROM sessions WHERE sessionId = ?', [sessionId], (err, result) => {
        if (err) {
            console.error('Error deleting session from MySQL:', err);
            return;
        }

        // Clear the session by removing the session ID from the cookie
        res.clearCookie('sessionId');

        // Redirect to the homepage
        res.redirect('/');
    });
});

// Handle registration form submission
app.post('/register', (req, res) => {
    const { username, password, age } = req.body;

    // Check if the username already exists
    pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error checking username in MySQL:', err);
            return;
        }

        if (results.length > 0) {
            // Username already exists, display an error message
            res.send(`Username already exists. Please choose a different username.
            <br>
            <button onclick="window.location.href='/'">Go to Homepage</button>
            
            `);
        } else {
            // Username is available, proceed with registration

            // Insert the new user into the users table
            pool.query('INSERT INTO users (username, password, age) VALUES (?, ?, ?)', [username, password, age], (err) => {
                if (err) {
                    console.error('Error registering user in MySQL:', err);
                    return;
                }

                // Redirect to the login page or any other page
                res.redirect('/login');
            });
        }
    });
});

// Set up routes
app.get('/register', (req, res) => {
    res.send(`
      <h1>Register</h1>
      <form action="/register" method="post">
        <input type="text" name="username" placeholder="Username" required><br>
        <input type="password" name="password" placeholder="Password" required><br>
        <input type="number" name="age" placeholder="Age" required><br>
        <button type="submit">Register</button>
      </form>
    `);
});




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

app.listen(8800, () => {
    console.log("Connect to localhost:8800")
})


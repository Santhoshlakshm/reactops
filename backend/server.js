const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Use your actual password here if you set one
  database: 'employeedb' // Make sure this DB exists
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
});



// Login API
app.post('/api/login', (req, res) => {
  const { log_id, pass_code } = req.body;

  // Make sure log_id and pass_code are provided
  if (!log_id || !pass_code) {
    return res.status(400).json({ success: false, message: 'Missing log_id or pass_code' });
  }

  const query = 'SELECT * FROM main_login WHERE log_id = ? AND pass_code = ?';
  db.query(query, [log_id, pass_code], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length > 0) {
      // You can also return the admin_access flag here
      return res.json({ success: true, admin_access: results[0].admin_access });
    } else {
      return res.json({ success: false });
    }
  });
});





// Get all employees
app.get('/api/employees', (req, res) => {
  const sql = 'SELECT * FROM employees';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add a new employee
app.post('/api/employees', (req, res) => {
  const { name, position, email } = req.body;
  
  if (!name || !position || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  console.log('Inserting into DB:', { name, position, email });

  const sql = 'INSERT INTO employees (name, position, email) VALUES (?, ?, ?)';
  db.query(sql, [name, position, email], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Failed to add employee' });
    }
    res.status(201).json({ message: 'Employee added', id: result.insertId });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

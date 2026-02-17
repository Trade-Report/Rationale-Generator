const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve React app for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Data file path
const DATA_FILE = process.env.DATA_FILE_PATH || path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      adminPassword: bcrypt.hashSync('admin123', 10) // Default admin password
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read data from file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], adminPassword: '' };
  }
}

// Write data to file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize on startup
initDataFile();

// API Routes

// Get all users with usage stats
app.get('/api/users', (req, res) => {
  const data = readData();
  res.json(data.users);
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const data = readData();
  
  // Check if username already exists
  if (data.users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    usage: {
      totalUploads: 0,
      excelUploads: 0,
      imageUploads: 0,
      lastActivity: null
    }
  };

  data.users.push(newUser);
  writeData(data);

  res.status(201).json({ 
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.createdAt
    }
  });
});

// Update user usage (called by rationale generator)
app.post('/api/users/:userId/usage', (req, res) => {
  const { userId } = req.params;
  const { fileType } = req.body;

  const data = readData();
  const user = data.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.usage.totalUploads += 1;
  if (fileType === 'excel') {
    user.usage.excelUploads += 1;
  } else if (fileType === 'image') {
    user.usage.imageUploads += 1;
  }
  user.usage.lastActivity = new Date().toISOString();

  writeData(data);
  res.json({ message: 'Usage updated successfully' });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const data = readData();
  
  if (bcrypt.compareSync(password, data.adminPassword)) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Delete user
app.delete('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const data = readData();
  
  const index = data.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  data.users.splice(index, 1);
  writeData(data);
  
  res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Admin Panel server running on http://localhost:${PORT}`);
});


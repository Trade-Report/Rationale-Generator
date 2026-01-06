const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Data file path (shared with admin or separate)
const DATA_FILE = path.join(__dirname, '..', 'admin_web', 'data.json');

// Read data from file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
}

// Write data to file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Helper function to detect file type
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const excelExtensions = ['.xlsx', '.xls', '.csv'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

  if (excelExtensions.includes(ext)) {
    return 'excel';
  } else if (imageExtensions.includes(ext)) {
    return 'image';
  }
  return 'unknown';
}

// API Routes

// User login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const data = readData();
  const user = data.users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Return user info without password
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      usage: user.usage
    }
  });
});

// Get user usage stats
app.get('/api/user/:userId/usage', (req, res) => {
  const { userId } = req.params;
  const data = readData();
  const user = data.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user.usage);
});

// File upload and analysis
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const fileType = detectFileType(req.file.originalname);

    if (fileType === 'unknown') {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported file type. Please upload Excel or Image files.' });
    }

    // Update user usage
    const data = readData();
    const user = data.users.find(u => u.id === userId);

    if (user) {
      user.usage.totalUploads += 1;
      if (fileType === 'excel') {
        user.usage.excelUploads += 1;
      } else if (fileType === 'image') {
        user.usage.imageUploads += 1;
      }
      user.usage.lastActivity = new Date().toISOString();
      writeData(data);

      // Notify admin panel (optional, for real-time updates)
      try {
        await axios.post(`https://rationale-generator-2.onrender.com/api/users/${userId}/usage`, {
          fileType: fileType
        });
      } catch (error) {
        // Admin panel might not be running, that's okay
        console.log('Could not notify admin panel:', error.message);
      }
    }

    // Prepare analysis prompt
    const analysisPrompt = `Analyze this ${fileType === 'excel' ? 'Excel spreadsheet' : 'image'} for trading insights. 
    Provide a detailed analysis including:
    1. Key patterns and trends
    2. Potential trading opportunities
    3. Risk assessment
    4. Recommendations`;

    // TODO: Integrate with Gemini API
    // For now, return a placeholder response
    const analysisResult = {
      fileType: fileType,
      fileName: req.file.originalname,
      analysis: `Analysis for ${fileType === 'excel' ? 'Excel file' : 'Image'}: ${req.file.originalname}\n\n` +
        `This is a placeholder response. Gemini API integration will be added here.\n\n` +
        `Prompt: ${analysisPrompt}`,
      timestamp: new Date().toISOString()
    };

    // Clean up uploaded file after processing
    // In production, you might want to keep it or process it differently
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }, 5000);

    res.json(analysisResult);

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file: ' + error.message });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rationale Generator server running on http://localhost:${PORT}`);
});


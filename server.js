require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())



// Serve static files (JS, CSS, images, etc.) from the project directory
const path = require('path');
app.use(express.static(__dirname));

// Serve the frontend HTML at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Example endpoint to get API key
app.get('/api-key', (req, res) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(404).json({ error: 'API key not found' });
  }
  res.json({ apiKey });
});

app.get("/ping", (req, res) => {
  const token = req.query.token;
  if (token !== process.env.PING_SECRET) {
    return res.status(403).send("Forbidden");
  }
  res.status(200).send("Render app is alive and secure!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

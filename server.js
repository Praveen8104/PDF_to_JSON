require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// Serve the frontend HTML at the root URL
const path = require('path');
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pdf_to_json.html'));
});

// Example endpoint to get API key
app.get('/api-key', (req, res) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(404).json({ error: 'API key not found' });
  }
  res.json({ apiKey });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

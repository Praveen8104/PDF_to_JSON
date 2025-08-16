require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

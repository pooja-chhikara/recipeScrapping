// backend/server.js

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors(
    {origin: '*'}
));
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server is running');
});

// API endpoint to search recipes
app.get('/scrape', (req, res) => {
  const query = req.query.dish;

  if (!query) {
    return res.status(400).json({ error: 'Dish name is required' });
    
  }
//   res.send('query received')

  // Call Python scraper to fetch recipe
  const pythonProcess = spawn('python', ['/Users/neerajkumar/Documents/CafeBackend/scrapers/scrape_recipe.py', query]);

  let data = '';
  let errorData = '';

  pythonProcess.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  pythonProcess.stderr.on('data', (chunk) => {
    errorData += chunk.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      console.error(`Error: ${errorData}`);
      return res.status(500).json({ error: 'Error scraping data' });
    }

    try {
      const recipe = JSON.parse(data);
      res.json([recipe]); // Send as an array to match FlatList requirements
    } catch (err) {
      console.error('Error parsing JSON:', err);
      res.status(500).json({ error: 'Error parsing recipe data' });
    }
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get song metadata
app.get('/api/songs', (req, res) => {
  const songsDir = path.join(__dirname, 'public', 'songs');

  try {
    const files = fs.readdirSync(songsDir);
    const songs = files
      .filter(file => path.extname(file).toLowerCase() === '.mp3')
      .map((file, index) => {
        const name = path.basename(file, '.mp3');
        let [artist, title] = name.split(' - ');
        if (!title) {
          title = artist;
          artist = 'Unknown Artist';
        }
        return {
          id: index + 1,
          title: title.trim(),
          artist: artist.trim(),
          url: `/songs/${encodeURIComponent(file)}`,
          duration: '0:00', // filled later on frontend
        };
      });

    res.json(songs);
  } catch (err) {
    console.error('Failed to read songs:', err);
    res.status(500).json({ error: 'Failed to load songs' });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});

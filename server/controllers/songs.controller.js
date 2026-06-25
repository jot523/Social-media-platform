/**
 * Songs Controller (MVC — Controller Layer)
 */

const Song = require('../models/Song');

// GET /api/songs — List/search songs
exports.getSongs = async (req, res) => {
  try {
    const { q, genre } = req.query;
    const filter = { isPublic: true };

    if (q?.trim()) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } }
      ];
    }

    if (genre) {
      filter.genre = genre;
    }

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch songs', error: err.message });
  }
};

// GET /api/songs/trending — Top songs by play count
exports.getTrending = async (req, res) => {
  try {
    const songs = await Song.find({ isPublic: true })
      .populate('uploadedBy', 'username fullName avatar')
      .sort({ plays: -1 })
      .limit(20);

    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trending songs', error: err.message });
  }
};

// POST /api/songs — Upload a new song
exports.uploadSong = async (req, res) => {
  try {
    const { title, artist, coverUrl, audioUrl, duration, genre } = req.body;
    if (!title || !artist || !audioUrl) {
      return res.status(400).json({ message: 'Title, artist, and audioUrl are required' });
    }

    const song = await Song.create({
      title,
      artist,
      coverUrl: coverUrl || '',
      audioUrl,
      duration: duration || 0,
      genre: genre || 'Pop',
      uploadedBy: req.user.id
    });

    const populated = await song.populate('uploadedBy', 'username fullName avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload song', error: err.message });
  }
};

// GET /api/songs/:id — Get single song
exports.getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username fullName avatar');

    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Increment play count
    song.plays += 1;
    await song.save();

    res.json(song);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch song', error: err.message });
  }
};

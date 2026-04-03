import * as statsModel from '../models/statsModels.js';

export const getStats = async (req, res) => {
  try {
    const [releases, artists, labels, formats, topGenres, topLabels, topArtists] =
      await Promise.all([
        statsModel.getTotalReleases(),
        statsModel.getTotalArtists(),
        statsModel.getTotalLabels(),
        statsModel.getFormatsStats(),
        statsModel.getTopGenres(),
        statsModel.getTopLabels(),
        statsModel.getTopArtists(),
      ]);

    res.json({
      releases,
      artists,
      labels,
      formats,
      topGenres,
      topLabels,
      topArtists,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

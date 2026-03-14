import * as genreModels from '../models/genreModels.js';

/* =========================
   GET
========================= */
export const getAllGenres = async (req, res, next) => {
  try {
    const genres = await genreModels.findAllGenres();
    res.json(genres);
  } catch (error) {
    console.error('findAllGenres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllGenresOrderById = async (req, res, next) => {
  try {
    const genres = await genreModels.findAllGenresOrderById();
    res.json(genres);
  } catch (error) {
    console.error('findAllGenresOrderById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getGenreById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const genre = await genreModels.findGenreById(id);
    res.json(genre);
  } catch (error) {
    console.error('findGenreById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllGenresBySearch = async (req, res) => {
  try {
    const { search } = req.query;

    const artists = await genreModels.findAllGenresBySearch({ search });

    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching genres' });
  }
};

/* =========================
   CREATE
========================= */
export const createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    // s'assurer qu'un name est saisi
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }

    // empêcher doublon
    const existing = await genreModels.findGenreByName(name);
    if (existing) {
      return res.status(409).json({ message: 'Genre déjà existant' });
    }

    // créer le genre
    const insertId = await genreModels.insertGenre(name.trim());

    res.status(201).json({
      id: insertId,
      name: name.trim(),
    });
  } catch (error) {
    console.error('CREATE GENRE ERROR:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Genre déjà existant' });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* =========================
   UPDATE
========================= */
export const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }

    const affectedRows = await genreModels.editGenreById(id, name.trim());

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Genre non trouvé' });
    }

    res.json({ id, name: name.trim() });
  } catch (error) {
    console.error('UPDATE GENRE ERROR:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Genre déjà existant' });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* =========================
   DELETE
========================= */
export const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await genreModels.eraseGenreById(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Genre non trouvé' });
    }

    res.json({ message: 'Genre supprimé' });
  } catch (error) {
    console.error(error);

    if (error.code === 'ENTITY_IN_USE') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur suppression' });
    }
  }
};

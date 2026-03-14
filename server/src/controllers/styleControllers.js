import * as styleModels from '../models/styleModels.js';

/* =========================
   GET
========================= */

export const getAllStyles = async (req, res, next) => {
  try {
    const styles = await styleModels.findAllStyles();
    res.json(styles);
  } catch (error) {
    console.error('findAllStyles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllStylesOrderById = async (req, res, next) => {
  try {
    const styles = await styleModels.findAllStylesOrderById();
    res.json(styles);
  } catch (error) {
    console.error('findAllStylesOrderById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getStyleById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const style = await styleModels.findStyleById(id);
    res.json(style);
  } catch (error) {
    console.error('findStyleById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllStylesBySearch = async (req, res) => {
  try {
    const { search } = req.query;

    const artists = await styleModels.findAllStylesBySearch({ search });

    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching styles' });
  }
};

/* =========================
   CREATE
========================= */
export const createStyle = async (req, res) => {
  try {
    const { name } = req.body;

    // s'assurer qu'un name est saisi
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }

    // empêcher doublon
    const existing = await styleModels.findStyleByName(name);
    if (existing) {
      return res.status(409).json({ message: 'Style déjà existant' });
    }

    // créer le genre
    const insertId = await styleModels.insertStyle(name.trim());

    res.status(201).json({
      id: insertId,
      name: name.trim(),
    });
  } catch (error) {
    console.error('CREATE STYLE ERROR:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Style déjà existant' });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* =========================
   UPDATE
========================= */
export const updateStyle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }

    const affectedRows = await styleModels.editStyleById(id, name.trim());

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Style non trouvé' });
    }

    res.json({ id, name: name.trim() });
  } catch (error) {
    console.error('UPDATE GENRE ERROR:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Style déjà existant' });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* =========================
   DELETE
========================= */
export const deleteStyle = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await styleModels.eraseStyleById(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Style non trouvé' });
    }

    res.json({ message: 'Style supprimé' });
  } catch (error) {
    console.error('DELETE STYLE ERROR:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Impossible de supprimer : Style utilisé dans une release',
      });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

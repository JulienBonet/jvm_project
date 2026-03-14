import * as labelModels from '../models/labelModels.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinaryFolders.js';
import { db } from '../../db/connection.js';

/* =========================
   GET
========================= */
export const getAllLabels = async (req, res) => {
  try {
    const artists = await labelModels.findAllLabels();
    res.json(artists);
  } catch (error) {
    console.error('Erreur getAllLabels:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllReleasesByLabelId = async (req, res) => {
  const { id } = req.params;

  try {
    const releases = await labelModels.findAllReleasesByLabelId(id);
    res.json(releases);
  } catch (error) {
    console.error('getAllReleasesByLabelId:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
export const getAllLabelsAdmin = async (req, res) => {
  try {
    const labels = await labelModels.findAllLabelsForAdmin();
    res.json(labels);
  } catch (error) {
    console.error('getAllLabelsAdmin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllLabelsBySearch = async (req, res) => {
  try {
    const { search } = req.query;

    const artists = await labelModels.findAllLabelsBySearch({ search });

    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching labels' });
  }
};

/* =========================
   CREATE
========================= */
export const createLabel = async (req, res) => {
  const connection = await db.getConnection();

  let uploadedFilename = null;

  try {
    const { name, sorted_name, discogs_id, discogs_image_url } = req.body;
    const file = req.file;

    await connection.beginTransaction();

    // 1️⃣ Vérifier doublon
    const existing = await labelModels.findLabelByName(connection, name);

    if (existing) {
      await connection.rollback();
      return res.status(409).json({ error: 'label déjà existant' });
    }

    let finalImage = '00_label_default';

    // 2️⃣ Upload image locale
    if (file) {
      uploadedFilename = await uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: CLOUDINARY_FOLDERS.LABEL,
        prefix: 'label',
      });

      finalImage = uploadedFilename;
    }

    // 3️⃣ Upload image Discogs
    else if (discogs_image_url) {
      const response = await fetch(discogs_image_url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      uploadedFilename = await uploadBufferToCloudinary({
        buffer,
        folder: CLOUDINARY_FOLDERS.LABEL,
        prefix: 'label',
      });

      finalImage = uploadedFilename;
    }

    // 4️⃣ Insert DB
    const labelId = await labelModels.addLabelWithImage({
      connection,
      name,
      sorted_name,
      discogs_id,
      image_filename: finalImage,
    });

    await connection.commit();

    res.status(201).json({ id: labelId });
  } catch (error) {
    await connection.rollback();

    // 🔥 Rollback Cloudinary si upload effectué
    if (uploadedFilename) {
      await deleteFromCloudinary({
        folder: CLOUDINARY_FOLDERS.LABEL,
        filename: uploadedFilename,
      });
    }

    console.error(error);
    res.status(500).json({ error: 'Erreur création' });
  } finally {
    connection.release();
  }
};
/* =========================
   UPDATE
========================= */
export const updateLabel = async (req, res) => {
  const connection = await db.getConnection();

  let uploadedFilename = null;

  try {
    const { name, sorted_name, discogs_id, discogs_image_url } = req.body;
    const file = req.file;
    const labelId = req.params.id;

    await connection.beginTransaction();

    // 1️⃣ Récupérer image actuelle
    const currentImage = await labelModels.getLabelImage(connection, labelId);

    let finalImage = currentImage;

    // 2️⃣ Upload image locale
    if (file) {
      uploadedFilename = await uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: CLOUDINARY_FOLDERS.LABEL,
        prefix: 'label',
      });

      finalImage = uploadedFilename;
    }

    // 3️⃣ Upload image Discogs
    else if (discogs_image_url) {
      const response = await fetch(discogs_image_url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      uploadedFilename = await uploadBufferToCloudinary({
        buffer,
        folder: CLOUDINARY_FOLDERS.LABEL,
        prefix: 'label',
      });

      finalImage = uploadedFilename;
    }

    // 4️⃣ Update DB
    await labelModels.updateLabelTransactional({
      connection,
      labelId,
      name,
      sorted_name,
      discogs_id,
      image_filename: finalImage,
    });

    await connection.commit();

    // 5️⃣ Supprimer ancienne image si remplacée
    if (uploadedFilename && currentImage && currentImage !== '00_label_default') {
      await deleteFromCloudinary({
        folder: CLOUDINARY_FOLDERS.LABEL,
        filename: currentImage,
      });
    }

    res.json({
      message: 'label updated',
      image_filename: finalImage,
    });
  } catch (error) {
    await connection.rollback();

    // rollback Cloudinary si upload fait
    if (uploadedFilename) {
      await deleteFromCloudinary({
        folder: CLOUDINARY_FOLDERS.LABEL,
        filename: uploadedFilename,
      });
    }

    console.error(error);
    res.status(500).json({ error: 'Erreur update' });
  } finally {
    connection.release();
  }
};
/* =========================
   DELETE
========================= */
export const deleteLabel = async (req, res) => {
  try {
    await labelModels.eraseLabel(req.params.id);
    res.json({ message: 'Label deleted' });
  } catch (error) {
    console.error(error);

    if (error.code === 'ENTITY_IN_USE') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur suppression' });
    }
  }
};
/* ===============================
  DISCOGS
================================= */
export const previewLabelFromDiscogs = async (req, res) => {
  try {
    const { discogsId } = req.params;

    if (!discogsId) {
      return res.status(400).json({ error: 'discogsId manquant' });
    }

    console.log('Preview Discogs ID:', discogsId);

    const response = await fetch(`https://api.discogs.com/labels/${discogsId}`, {
      headers: {
        Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.log('Discogs non trouvé');
      return res.status(404).json({ error: 'Artiste introuvable sur Discogs' });
    }

    const data = await response.json();

    res.json({
      name: data.name || '',
      sorted_name: data.name || '',
      image_url: data.images?.[0]?.uri || null,
    });
  } catch (error) {
    console.error('Erreur preview Discogs:', error);
    res.status(500).json({ error: 'Erreur preview Discogs' });
  }
};

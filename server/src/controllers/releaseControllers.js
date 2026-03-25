// server\src\controllers\releaseControllers.js
import { db } from '../../db/connection.js';
import * as releaseModels from '../models/releaseModels.js';
import * as releaseCreateModels from '../models/releaseCreateModels.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinaryFolders.js';
import { parseJSON } from '../utils/parsePayload.js';
import { cleanOrphanEntities } from '../utils/cleanOrphanEntities.js';
import { eraseRelease } from '../models/releaseDeleteModels.js';
import { mapDiscogsRelease } from '../services/discogsMapper.js';

export const getAllReleases = async (req, res, next) => {
  try {
    const releases = await releaseModels.findAllReleases();
    res.json(releases);
  } catch (err) {
    next(err);
  }
};

export const getReleaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const release = await releaseModels.findReleaseById(id);

    if (!release) return res.status(404).json({ message: 'Release not found' });

    res.json(release);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   CREATE
========================= */

export const createRelease = async (req, res) => {
  const connection = await db.getConnection();

  let uploadedFilename = null;

  try {
    const file = req.file;
    const payload = {
      ...req.body,
      release: parseJSON(req.body.release, {}),
      artists: parseJSON(req.body.artists, []),
      labels: parseJSON(req.body.labels, []),
      genres: parseJSON(req.body.genres, []),
      styles: parseJSON(req.body.styles, []),
      links: parseJSON(req.body.links, []),
      tracks: parseJSON(req.body.tracks, []),
      disc: parseJSON(req.body.disc, {}),
    };

    console.log(payload);

    await connection.beginTransaction();

    let finalImage = '00_release_default';

    // 1️⃣ Upload image locale
    if (file) {
      uploadedFilename = await uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: CLOUDINARY_FOLDERS.RELEASE,
        prefix: 'release',
      });

      finalImage = uploadedFilename;
    }

    // 2️⃣ Upload image Discogs
    else if (payload.release.discogs_image_url) {
      const response = await fetch(payload.release.discogs_image_url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      uploadedFilename = await uploadBufferToCloudinary({
        buffer,
        folder: CLOUDINARY_FOLDERS.RELEASE,
        prefix: 'release',
      });

      finalImage = uploadedFilename;
    }

    // inject image dans payload
    payload.image_filename = finalImage;
    payload.thumbnail_url = payload.discogs_image_url || null;

    // gestion links dans payload
    payload.links = payload.links || payload.external_link || [];

    const newRelease = await releaseCreateModels.addRelease(payload, connection);
    console.log('model returned :', newRelease);
    await connection.commit();
    console.log('NEW RELEASE', newRelease);
    res.status(201).json(newRelease);
  } catch (error) {
    await connection.rollback();

    // rollback cloudinary
    if (uploadedFilename) {
      await deleteFromCloudinary({
        folder: CLOUDINARY_FOLDERS.RELEASE,
        filename: uploadedFilename,
      });
    }

    console.error(error);
    res.status(500).json({
      message: 'Error creating release',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    connection.release();
  }
};

/* =========================
   FETCH DISCOGS API
========================= */
export const fetchDiscogsRelease = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`https://api.discogs.com/releases/${id}`, {
      headers: {
        'User-Agent': 'vinyl-collection-app',
      },
    });

    const data = await response.json();

    // res.json(data);
    const mapped = mapDiscogsRelease(data);

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Discogs fetch failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/* =========================
   UPDATE
========================= */
export const updateRelease = async (req, res) => {
  const connection = await db.getConnection();
  let uploadedFilename = null;

  try {
    const { id } = req.params;
    const file = req.file;

    const payload = {
      release: {
        ...parseJSON(req.body.release, {}),
        ...(req.body.title ? { title: req.body.title } : {}),
        ...(req.body.year ? { year: parseInt(req.body.year, 10) } : {}),
        ...(req.body.country ? { country: req.body.country } : {}),
        // etc.
      },
      artists: parseJSON(req.body.artists, []),
      labels: parseJSON(req.body.labels, []),
      genres: parseJSON(req.body.genres, []),
      styles: parseJSON(req.body.styles, []),
      links: parseJSON(req.body.links, []),
      tracks: parseJSON(req.body.tracks, []),
      disc: parseJSON(req.body.disc, {}),
    };

    console.info('payload', payload);

    await connection.beginTransaction();

    // 🧠 1. READ EXISTING IMAGE
    const [existingImages] = await connection.query(
      `SELECT url FROM image 
       WHERE entity_type='release' AND entity_id=?`,
      [id],
    );

    const oldFilename = existingImages[0]?.url || null;

    // 🧠 2. READ ARTISTS LABELS GENRES STYLES
    const [oldArtists] = await connection.query(
      `SELECT artist_id FROM release_artist WHERE release_id = ?`,
      [id],
    );

    const [oldLabels] = await connection.query(
      `SELECT label_id FROM release_label WHERE release_id = ?`,
      [id],
    );

    const [oldGenres] = await connection.query(
      `SELECT genre_id FROM release_genre WHERE release_id = ?`,
      [id],
    );

    const [oldStyles] = await connection.query(
      `SELECT style_id FROM release_style WHERE release_id = ?`,
      [id],
    );

    // 🧨 3. DELETE EXISTING DATA (DB ONLY)
    await releaseModels.deleteReleaseRelations(id, connection);

    // 🖼️ 4. IMAGE LOGIC
    let finalImage = oldFilename;

    if (file) {
      uploadedFilename = await uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: CLOUDINARY_FOLDERS.RELEASE,
        prefix: 'release',
      });

      finalImage = uploadedFilename;

      if (oldFilename) {
        await deleteFromCloudinary({
          folder: CLOUDINARY_FOLDERS.RELEASE,
          filename: oldFilename,
        });
      }
    } else if (payload.release.discogs_image_url) {
      const response = await fetch(payload.release.discogs_image_url);
      const buffer = Buffer.from(await response.arrayBuffer());

      uploadedFilename = await uploadBufferToCloudinary({
        buffer,
        folder: CLOUDINARY_FOLDERS.RELEASE,
        prefix: 'release',
      });

      finalImage = uploadedFilename;

      if (oldFilename) {
        await deleteFromCloudinary({
          folder: CLOUDINARY_FOLDERS.RELEASE,
          filename: oldFilename,
        });
      }
    }

    // 🧠 inject
    payload.image_filename = finalImage;
    payload.thumbnail_url = payload.release.discogs_image_url || null;

    // 🧱 5. UPDATE MAIN
    await releaseModels.updateReleaseMain(id, payload.release, connection);

    // 🧩 6. REINSERT RELATIONS
    await releaseCreateModels.insertReleaseRelations(id, payload, connection);

    // ✅ 7. CLEAN ORPHANS
    await cleanOrphanEntities(connection, {
      artists: oldArtists,
      labels: oldLabels,
      genres: oldGenres,
      styles: oldStyles,
    });

    await connection.commit();

    res.status(200).json({ id });
  } catch (error) {
    await connection.rollback();

    // rollback cloudinary si upload échoue
    if (uploadedFilename) {
      await deleteFromCloudinary({
        folder: CLOUDINARY_FOLDERS.RELEASE,
        filename: uploadedFilename,
      });
    }

    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  } finally {
    connection.release();
  }
};

/* =========================
   DELETE
========================= */

export const deleteRelease = async (req, res) => {
  try {
    const releaseId = Number(req.params.id);

    if (!releaseId) {
      return res.status(400).json({ error: 'Invalid release id' });
    }

    await eraseRelease(releaseId);

    res.status(200).json({ message: 'Release deleted successfully' });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erreur suppression release',
    });
  }
};

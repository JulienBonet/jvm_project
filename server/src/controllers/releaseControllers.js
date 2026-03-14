import { db } from '../../db/connection.js';
import * as releaseModels from '../models/releaseModels.js';
import * as releaseCreateModels from '../models/releaseCreateModels.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinaryFolders.js';
import { parseJSON } from '../utils/parsePayload.js';

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

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Discogs fetch failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

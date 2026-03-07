import { db } from '../../db/connection.js';
import cloudinary from 'cloudinary';

/* =========================
   GET
========================= */
export const findAllArtists = async () => {
  const [rows] = await db.query(`
    SELECT
      a.id,
      a.name,
      a.sorted_name,
      i.url AS image_url
    FROM artist a
    LEFT JOIN image i
      ON i.entity_type = 'artist'
     AND i.entity_id = a.id
    GROUP BY a.id, a.name, a.sorted_name,i.url
    ORDER BY a.sorted_name
  `);

  return rows;
};

export const findAllReleasesByArtistId = async (artistId) => {
  const [rows] = await db.query(
    `
    SELECT
      r.id,
      r.title,
      r.year,
      r.release_type,
      GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS artists,
      GROUP_CONCAT(DISTINCT l.name SEPARATOR ', ') AS labels,
      d.size AS disc_size,
      d.speed AS disc_speed,
      img.url AS image_url
    FROM release_artist ra
    JOIN releases r
      ON r.id = ra.release_id
    JOIN artist a
      ON a.id = ra.artist_id
    LEFT JOIN release_artist ra_all
      ON ra_all.release_id = r.id
    LEFT JOIN artist a_all
      ON a_all.id = ra_all.artist_id
    LEFT JOIN release_label rl
      ON rl.release_id = r.id
    LEFT JOIN label l
      ON l.id = rl.label_id
    LEFT JOIN disc d
      ON d.release_id = r.id
      AND d.disc_number = 1
    LEFT JOIN image img
      ON img.entity_type = 'release'
      AND img.entity_id = r.id
      AND img.type = 'cover'
    WHERE ra.artist_id = ?
    GROUP BY
      r.id, r.title, r.year, r.release_type, d.size, d.speed, img.url
    ORDER BY r.year DESC, r.title;
    `,
    [artistId],
  );

  return rows;
};

export const findArtistById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      a.id,
      a.name,
      a.sorted_name,
      a.discogs_id,
      i.url AS image_url
    FROM artist a
    LEFT JOIN image i
      ON i.entity_type = 'artist'
     AND i.entity_id = a.id
    WHERE a.id = ?;
  `,
    [id],
  );

  return rows;
};

export const findArtistByIdTransactional = async (connection, id) => {
  const [rows] = await connection.query(
    `
    SELECT
      a.id,
      a.name,
      a.sorted_name,
      a.discogs_id,
      i.url AS image_url
    FROM artist a
    LEFT JOIN image i
      ON i.entity_type = 'artist'
     AND i.entity_id = a.id
    WHERE a.id = ?;
    `,
    [id],
  );

  return rows[0] || null;
};

export const findAllArtistsForAdmin = async () => {
  const [rows] = await db.query(`
    SELECT
      a.id,
      a.name,
      a.sorted_name,
      a.discogs_id,
      img.url AS image_url,
      COUNT(DISTINCT ra.release_id) AS release_count
    FROM artist a
    LEFT JOIN release_artist ra
      ON ra.artist_id = a.id
    LEFT JOIN image img
      ON img.entity_type = 'artist'
     AND img.entity_id = a.id
    GROUP BY
      a.id,
      a.name,
      a.sorted_name,
      a.discogs_id,
      img.url
    ORDER BY a.id DESC
  `);

  return rows;
};

/* ===============================
   CREATE
================================= */
const DEFAULT_ARTIST_IMAGE = '00_artist_default';

export const addArtist = async ({ name, sorted_name, discogs_id, image_url }) => {
  const finalSortedName = sorted_name && sorted_name.trim() !== '' ? sorted_name : name;

  const [result] = await db.query(
    `INSERT INTO artist (name, sorted_name, discogs_id)
     VALUES (?, ?, ?)`,
    [name, finalSortedName, discogs_id || null],
  );

  const finalImage = image_url || DEFAULT_ARTIST_IMAGE;

  await db.query(
    `INSERT INTO image (entity_type, entity_id, url)
     VALUES ('artist', ?, ?)`,
    [result.insertId, finalImage],
  );

  return result.insertId;
};

export const addArtistWithImage = async ({
  connection,
  name,
  sorted_name,
  discogs_id,
  image_filename,
}) => {
  const finalSortedName = sorted_name && sorted_name.trim() !== '' ? sorted_name : name;

  const [result] = await connection.query(
    `INSERT INTO artist (name, sorted_name, discogs_id)
     VALUES (?, ?, ?)`,
    [name, finalSortedName, discogs_id || null],
  );

  const artistId = result.insertId;

  await connection.query(
    `INSERT INTO image (entity_type, entity_id, url)
     VALUES ('artist', ?, ?)`,
    [artistId, image_filename],
  );

  return artistId;
};

export const findArtistByName = async (connection, name) => {
  const [rows] = await connection.query(`SELECT id FROM artist WHERE name = ?`, [name]);

  return rows[0] || null;
};

/* ===============================
   UPDATE
================================= */
export const updateArtistTransactional = async ({
  connection,
  artistId,
  name,
  sorted_name,
  discogs_id,
  image_filename,
}) => {
  const finalSortedName = sorted_name && sorted_name.trim() !== '' ? sorted_name : name;

  await connection.query(
    `UPDATE artist
     SET name = ?, sorted_name = ?, discogs_id = ?
     WHERE id = ?`,
    [name, finalSortedName, discogs_id || null, artistId],
  );

  const [existing] = await connection.query(
    `SELECT id FROM image
     WHERE entity_type = 'artist'
       AND entity_id = ?`,
    [artistId],
  );

  if (existing.length > 0) {
    await connection.query(
      `UPDATE image
       SET url = ?
       WHERE entity_type = 'artist'
         AND entity_id = ?`,
      [image_filename, artistId],
    );
  } else {
    await connection.query(
      `INSERT INTO image (entity_type, entity_id, url)
       VALUES ('artist', ?, ?)`,
      [artistId, image_filename],
    );
  }
};

export const getArtistImage = async (connection, artistId) => {
  const [rows] = await connection.query(
    `SELECT url
     FROM image
     WHERE entity_type = 'artist'
       AND entity_id = ?`,
    [artistId],
  );

  return rows[0]?.url || '00_artist_default';
};

/* ===============================
   DELETE
================================= */

export const eraseArtist = async (id) => {
  // 1. récupérer l'image
  const [rows] = await db.query(
    `SELECT url FROM image WHERE entity_type='artist' AND entity_id=?`,
    [id],
  );
  const imageUrl = rows[0]?.url;

  // 2. si ce n'est pas la default, supprimer de Cloudinary
  if (imageUrl && imageUrl !== '00_artist_default') {
    // Extraire le public_id pour Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0]; // si URL complète
    await cloudinary.v2.uploader.destroy(`jvm/artists/${publicId}`);
  }

  // 3. supprimer l’entrée dans image
  await db.query(`DELETE FROM image WHERE entity_type='artist' AND entity_id=?`, [id]);

  // 4. supprimer l’artiste
  await db.query(`DELETE FROM artist WHERE id=?`, [id]);
};

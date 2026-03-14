import { db } from '../../db/connection.js';
import cloudinary from 'cloudinary';

/* =========================
   GET
========================= */
export const findAllLabels = async () => {
  const [rows] = await db.query(`
    SELECT
      l.id,
      l.name,
      i.url AS image_url
    FROM label l
    LEFT JOIN image i
      ON i.entity_type = 'label'
     AND i.entity_id = l.id
    GROUP BY l.id, l.name, i.url
    ORDER BY l.sorted_name;
  `);

  return rows;
};

export const findAllReleasesByLabelId = async (labelId) => {
  const [rows] = await db.query(
    `
    SELECT
      r.id,
      r.title,
      r.year,
      r.release_type,
      GROUP_CONCAT(DISTINCT a_all.name SEPARATOR ', ') AS artists,
      GROUP_CONCAT(DISTINCT l.name SEPARATOR ', ') AS labels,
      d.size AS disc_size,
      d.speed AS disc_speed,
      img.url AS image_url
    FROM release_label rl_filter
    JOIN releases r
      ON r.id = rl_filter.release_id
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
    WHERE rl_filter.label_id = ?
    GROUP BY
      r.id, r.title, r.year, r.release_type, d.size, d.speed, img.url
      ORDER BY r.year DESC, r.title;
    `,
    [labelId],
  );

  return rows;
};

export const findAllLabelsForAdmin = async () => {
  const [rows] = await db.query(`
    SELECT
      l.id,
      l.name,
      l.sorted_name,
      l.discogs_id,
      img.url AS image_url,
      COUNT(DISTINCT rl.release_id) AS release_count
    FROM label l
    LEFT JOIN release_label rl
      ON rl.label_id = l.id
    LEFT JOIN image img
      ON img.entity_type = 'label'
     AND img.entity_id = l.id
    GROUP BY
      l.id,
      l.name,
      l.sorted_name,
      l.discogs_id,
      img.url
    ORDER BY l.id DESC
  `);

  return rows;
};

export const findAllLabelsBySearch = async ({ search }) => {
  let query = `
    SELECT id, name
    FROM label
  `;

  const params = [];

  if (search) {
    query += ` WHERE name LIKE ? `;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY name LIMIT 20`;

  const [rows] = await db.query(query, params);

  return rows;
};

/* ===============================
   CREATE
================================= */
const DEFAULT_LABEL_IMAGE = '00_label_default';

export const addLabel = async ({ name, sorted_name, discogs_id, image_url }) => {
  const finalSortedName = sorted_name && sorted_name.trim() !== '' ? sorted_name : name;

  const [result] = await db.query(
    `INSERT INTO label (name, sorted_name, discogs_id)
     VALUES (?, ?, ?)`,
    [name, finalSortedName, discogs_id || null],
  );

  const finalImage = image_url || DEFAULT_LABEL_IMAGE;

  await db.query(
    `INSERT INTO label (entity_type, entity_id, url)
     VALUES ('label', ?, ?)`,
    [result.insertId, finalImage],
  );

  return result.insertId;
};

export const addLabelWithImage = async ({
  connection,
  name,
  sorted_name,
  discogs_id,
  image_filename,
}) => {
  const finalSortedName = sorted_name && sorted_name.trim() !== '' ? sorted_name : name;

  const [result] = await connection.query(
    `INSERT INTO label (name, sorted_name, discogs_id)
     VALUES (?, ?, ?)`,
    [name, finalSortedName, discogs_id || null],
  );

  const labelId = result.insertId;

  await connection.query(
    `INSERT INTO image (entity_type, entity_id, url)
     VALUES ('label', ?, ?)`,
    [labelId, image_filename],
  );

  return labelId;
};

export const findLabelByName = async (connection, name) => {
  const [rows] = await connection.query(`SELECT id FROM label WHERE name = ?`, [name]);

  return rows[0] || null;
};
/* ===============================
   UPDATE
================================= */
export const updateLabelTransactional = async ({
  connection,
  labelId,
  name,
  sorted_name,
  discogs_id,
  image_filename,
}) => {
  const finalSortedName = sorted_name && sorted_name.trim() !== '' ? sorted_name : name;

  await connection.query(
    `UPDATE label
     SET name = ?, sorted_name = ?, discogs_id = ?
     WHERE id = ?`,
    [name, finalSortedName, discogs_id || null, labelId],
  );

  const [existing] = await connection.query(
    `SELECT id FROM image
     WHERE entity_type = 'label'
       AND entity_id = ?`,
    [labelId],
  );

  if (existing.length > 0) {
    await connection.query(
      `UPDATE image
       SET url = ?
       WHERE entity_type = 'label'
         AND entity_id = ?`,
      [image_filename, labelId],
    );
  } else {
    await connection.query(
      `INSERT INTO image (entity_type, entity_id, url)
       VALUES ('label', ?, ?)`,
      [labelId, image_filename],
    );
  }
};
export const getLabelImage = async (connection, labelId) => {
  const [rows] = await connection.query(
    `SELECT url
     FROM image
     WHERE entity_type = 'label'
       AND entity_id = ?`,
    [labelId],
  );

  return rows[0]?.url || '00_label_default';
};
/* ===============================
   DELETE
================================= */

export const eraseLabel = async (id) => {
  // 1. récupérer l'image
  const [rows] = await db.query(`SELECT url FROM image WHERE entity_type='label' AND entity_id=?`, [
    id,
  ]);
  const imageUrl = rows[0]?.url;

  // 2. si ce n'est pas la default, supprimer de Cloudinary
  if (imageUrl && imageUrl !== '00_label_default') {
    // Extraire le public_id pour Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0]; // si URL complète
    await cloudinary.v2.uploader.destroy(`jvm/labels/${publicId}`);
  }

  // 3. supprimer l’entrée dans image
  await db.query(`DELETE FROM image WHERE entity_type='label' AND entity_id=?`, [id]);

  // 4. supprimer le Label
  await db.query(`DELETE FROM label WHERE id=?`, [id]);
};

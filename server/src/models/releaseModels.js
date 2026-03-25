// server\src\models\releaseModels.js
import { db } from '../../db/connection.js';

/* =========================
   GET
========================= */
export const findAllReleases = async () => {
  const [rows] = await db.query(`
    SELECT 
        r.id,
        r.title,
        r.year,
        r.release_type,
        GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS artists,
        GROUP_CONCAT(DISTINCT l.name SEPARATOR ', ') AS labels,
        GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genres,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS styles,
        MAX(i.url) AS image_url,
        d.size AS disc_size,
        d.speed AS disc_speed
    FROM releases r
    LEFT JOIN release_artist ra ON ra.release_id = r.id
    LEFT JOIN artist a ON a.id = ra.artist_id
    LEFT JOIN release_label rl ON rl.release_id = r.id
    LEFT JOIN label l ON l.id = rl.label_id
    LEFT JOIN release_genre rg ON rg.release_id = r.id
    LEFT JOIN genre g ON g.id = rg.genre_id
    LEFT JOIN release_style rs ON rs.release_id = r.id
    LEFT JOIN style s ON s.id = rs.style_id
    LEFT JOIN image i 
        ON i.entity_type = 'release' 
        AND i.entity_id = r.id
        AND i.type = 'cover'
    LEFT JOIN disc d 
        ON d.release_id = r.id
        AND d.disc_number = 1
    GROUP BY r.id, r.title, r.year, r.release_type, d.size, d.speed
    ORDER BY r.id DESC;
  `);

  return rows;
};

export const findReleaseById = async (releaseId) => {
  // Infos de base
  const [release] = await db.query('SELECT * FROM releases WHERE id = ?', [releaseId]);

  if (!release.length) return null;

  const releaseData = release[0];

  // cover
  const [cover] = await db.query(
    `
    SELECT i.id, i.url AS image_url
    FROM image i
    WHERE entity_type = "release"
    AND entity_id = ?;
    `,
    [releaseId],
  );

  // Artistes
  const [artists] = await db.query(
    `
    SELECT a.id, a.name, ra.role
    FROM release_artist ra
    JOIN artist a ON a.id = ra.artist_id
    WHERE ra.release_id = ?`,
    [releaseId],
  );

  // Labels
  const [labels] = await db.query(
    `
    SELECT l.id, l.name, rl.catalog_number
    FROM release_label rl
    JOIN label l ON l.id = rl.label_id
    WHERE rl.release_id = ?`,
    [releaseId],
  );

  // Genres
  const [genres] = await db.query(
    `
    SELECT g.id, g.name
    FROM release_genre rg
    JOIN genre g ON g.id = rg.genre_id
    WHERE rg.release_id = ?`,
    [releaseId],
  );

  // Styles
  const [styles] = await db.query(
    `
    SELECT s.id, s.name
    FROM release_style rs
    JOIN style s ON s.id = rs.style_id
    WHERE rs.release_id = ?`,
    [releaseId],
  );

  // Disques, faces, tracks
  const [tracks] = await db.query(
    `
    SELECT
        d.disc_number,
        d.size,
        d.speed,
        si.name AS side,
        t.position,
        t.title,
        t.duration
    FROM disc d
    JOIN side si ON si.disc_id = d.id
    JOIN track t ON t.side_id = si.id
    WHERE d.release_id = ?
    ORDER BY d.disc_number, si.name, t.position`,
    [releaseId],
  );

  // External links
  const [links] = await db.query(
    `
    SELECT id, platform, url
    FROM external_link
    WHERE entity_type = 'release'
    AND entity_id = ?
    `,
    [releaseId],
  );

  return {
    ...releaseData,
    cover,
    artists,
    labels,
    genres,
    styles,
    tracks,
    links,
  };
};

/* =========================
   UPDATE
========================= */
export const deleteReleaseRelations = async (releaseId, conn) => {
  // tracks → side → disc
  await conn.query(
    `
    DELETE t FROM track t
    JOIN side s ON t.side_id = s.id
    JOIN disc d ON s.disc_id = d.id
    WHERE d.release_id = ?
  `,
    [releaseId],
  );

  await conn.query(
    `
    DELETE s FROM side s
    JOIN disc d ON s.disc_id = d.id
    WHERE d.release_id = ?
  `,
    [releaseId],
  );

  await conn.query(`DELETE FROM disc WHERE release_id = ?`, [releaseId]);

  await conn.query(`DELETE FROM release_artist WHERE release_id = ?`, [releaseId]);
  await conn.query(`DELETE FROM release_label WHERE release_id = ?`, [releaseId]);
  await conn.query(`DELETE FROM release_genre WHERE release_id = ?`, [releaseId]);
  await conn.query(`DELETE FROM release_style WHERE release_id = ?`, [releaseId]);

  await conn.query(
    `
    DELETE FROM external_link 
    WHERE entity_type='release' AND entity_id=?
  `,
    [releaseId],
  );

  await conn.query(
    `
    DELETE FROM image 
    WHERE entity_type='release' AND entity_id=?
  `,
    [releaseId],
  );
};

export const updateReleaseMain = async (id, release, conn) => {
  const fields = [];
  const values = [];

  for (const key of [
    'title',
    'year',
    'country',
    'barcode',
    'notes',
    'release_type',
    'discogs_id',
  ]) {
    if (release[key] !== undefined && release[key] !== null) {
      fields.push(`${key}=?`);
      values.push(release[key]);
    }
  }

  if (fields.length === 0) return;

  await conn.query(`UPDATE releases SET ${fields.join(', ')} WHERE id=?`, [...values, id]);
};

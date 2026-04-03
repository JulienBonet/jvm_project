import { db } from '../../db/connection.js';

export const getTotalReleases = async () => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM releases');
  return rows[0].total;
};

export const getTotalArtists = async () => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM artist');
  return rows[0].total;
};

export const getTotalLabels = async () => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM label');
  return rows[0].total;
};

export const getFormatsStats = async () => {
  const [rows] = await db.query(`
    SELECT 
      CASE 
        WHEN size IN ('10', '12', '10"', '12"') THEN 'big'
        WHEN size IN ('7', '7"') THEN '7'
        ELSE 'other'
      END AS format_group,
      COUNT(DISTINCT release_id) AS total
    FROM disc
    WHERE size IS NOT NULL
    GROUP BY format_group
  `);
  return rows;
};

export const getTopGenres = async () => {
  const [rows] = await db.query(`
    SELECT 
      g.name,
      COUNT(DISTINCT rg.release_id) AS total
    FROM release_genre rg
    JOIN genre g ON g.id = rg.genre_id
    GROUP BY g.id
    ORDER BY total DESC
    LIMIT 10
  `);
  return rows;
};

export const getTopLabels = async () => {
  const [rows] = await db.query(`
    SELECT 
      l.name,
      COUNT(DISTINCT rl.release_id) AS total
    FROM release_label rl
    JOIN label l ON l.id = rl.label_id
    GROUP BY l.id
    ORDER BY total DESC
    LIMIT 10
  `);
  return rows;
};

export const getTopArtists = async () => {
  const [rows] = await db.query(`
    SELECT 
      a.name,
      COUNT(DISTINCT ra.release_id) AS total
    FROM release_artist ra
    JOIN artist a ON a.id = ra.artist_id
    WHERE ra.role = 'Main'
    GROUP BY a.id
    ORDER BY total DESC
    LIMIT 10
  `);
  return rows;
};

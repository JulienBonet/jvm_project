// server\src\models\genreModels.js
import { db } from '../../db/connection.js';

/* =========================
   GET
========================= */
export const findAllGenres = async () => {
  const [rows] = await db.query(`
    SELECT id, name
    FROM genre
    ORDER BY name ASC
  `);
  return rows;
};

export const findAllGenresOrderById = async () => {
  const [rows] = await db.query(`
    SELECT id, name
    FROM genre
    ORDER BY id DESC
  `);
  return rows;
};

export const findGenreById = async (id) => {
  const [rows] = await db.query(
    `SELECT *
    FROM genre
    WHERE id = ?
    `,
    [id],
  );
  return rows;
};

export const findGenreByName = async (name) => {
  const [rows] = await db.query(
    `SELECT *
     FROM genre
     WHERE name = ?`,
    [name],
  );
  return rows.length > 0 ? rows[0] : null;
};

export const findAllGenresBySearch = async ({ search }) => {
  let query = `
    SELECT id, name
    FROM genre
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

/* =========================
   CREATE
========================= */
export const insertGenre = async (name) => {
  const [result] = await db.query('INSERT INTO genre (name) VALUES (?)', [name]);
  return result.insertId;
};

/* =========================
   UPDATE
========================= */
export const editGenreById = async (id, name) => {
  const [result] = await db.query('UPDATE genre SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows;
};

/* =========================
   DELETE
========================= */

export const eraseGenreById = async (id, connection = null) => {
  const query = connection ? connection.query.bind(connection) : db.query.bind(db);

  // Vérifier si le genre est utilisé par une release
  const [blockingReleases] = await query(
    `SELECT r.title, r.year
     FROM releases r
     JOIN release_genre rg ON rg.release_id = r.id
     WHERE rg.genre_id = ?`,
    [id],
  );

  if (blockingReleases.length > 0) {
    // construire un message lisible
    const titles = blockingReleases.map((r) => `${r.title} (${r.year})`).join(', ');
    const message = `Impossible de supprimer : genre utilisé par ces releases : ${titles}`;
    const error = new Error(message);
    error.code = 'ENTITY_IN_USE';
    throw error;
  }

  // Effacer le Genre
  const [result] = await query('DELETE FROM genre WHERE id = ?', [id]);
  return result.affectedRows;
};

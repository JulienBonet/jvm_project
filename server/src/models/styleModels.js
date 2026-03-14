// server\src\models\styleModels.js
import { db } from '../../db/connection.js';

/* =========================
   GET
========================= */

export const findAllStyles = async () => {
  const [rows] = await db.query(`
    SELECT id, name
    FROM style
    ORDER BY name ASC
  `);
  return rows;
};

export const findAllStylesOrderById = async () => {
  const [rows] = await db.query(`
    SELECT id, name
    FROM style
    ORDER BY id DESC
  `);
  return rows;
};

export const findStyleById = async (id) => {
  const [rows] = await db.query(
    `SELECT *
    FROM style
    WHERE id = ?
    `,
    [id],
  );
  return rows;
};

export const findStyleByName = async (name) => {
  const [rows] = await db.query(
    `SELECT *
     FROM style
     WHERE name = ?`,
    [name],
  );
  return rows.length > 0 ? rows[0] : null;
};

export const findAllStylesBySearch = async ({ search }) => {
  let query = `
    SELECT id, name
    FROM style
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
export const insertStyle = async (name) => {
  const [result] = await db.query('INSERT INTO style (name) VALUES (?)', [name]);
  return result.insertId;
};

/* =========================
   UPDATE
========================= */
export const editStyleById = async (id, name) => {
  const [result] = await db.query('UPDATE style SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows;
};

/* =========================
   DELETE
========================= */
export const eraseStyleById = async (id, connection = null) => {
  const query = connection ? connection.query.bind(connection) : db.query.bind(db);

  // Vérifier si le style est utilisé par une release
  const [blockingReleases] = await query(
    `SELECT r.title, r.year
     FROM releases r
     JOIN release_style rs ON rs.release_id = r.id
     WHERE rs.style_id = ?`,
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

  // Effacer le Style
  const [result] = await query('DELETE FROM style WHERE id = ?', [id]);
  return result.affectedRows;
};

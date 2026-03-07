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
export const eraseStyleById = async (id) => {
  const [result] = await db.query('DELETE FROM style WHERE id = ?', [id]);
  return result.affectedRows;
};

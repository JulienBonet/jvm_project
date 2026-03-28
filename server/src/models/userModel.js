// server\src\models\userModel.js
import { db } from '../../db/connection.js';

const findByUsername = async (username) => {
  const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
  return rows[0];
};

export default { findByUsername };

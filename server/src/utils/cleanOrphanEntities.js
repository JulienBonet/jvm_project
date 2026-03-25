// server\src\utils\cleanOrphanEntities.js
export const cleanOrphanEntities = async (conn, entities) => {
  // ARTISTS
  for (const a of entities.artists) {
    const [[count]] = await conn.query(
      `SELECT COUNT(*) as count FROM release_artist WHERE artist_id = ?`,
      [a.artist_id],
    );

    if (count.count === 0) {
      await conn.query(`DELETE FROM artist WHERE id = ?`, [a.artist_id]);
    }
  }

  // LABELS
  for (const l of entities.labels) {
    const [[count]] = await conn.query(
      `SELECT COUNT(*) as count FROM release_label WHERE label_id = ?`,
      [l.label_id],
    );

    if (count.count === 0) {
      await conn.query(`DELETE FROM label WHERE id = ?`, [l.label_id]);
    }
  }

  // GENRES
  for (const g of entities.genres) {
    const [[count]] = await conn.query(
      `SELECT COUNT(*) as count FROM release_genre WHERE genre_id = ?`,
      [g.genre_id],
    );

    if (count.count === 0) {
      await conn.query(`DELETE FROM genre WHERE id = ?`, [g.genre_id]);
    }
  }

  // STYLES
  for (const s of entities.styles) {
    const [[count]] = await conn.query(
      `SELECT COUNT(*) as count FROM release_style WHERE style_id = ?`,
      [s.style_id],
    );

    if (count.count === 0) {
      await conn.query(`DELETE FROM style WHERE id = ?`, [s.style_id]);
    }
  }
};

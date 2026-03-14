import { getOrCreateArtist } from '../utils/getOrCreateArtist.js';
import { getOrCreateLabel } from '../utils/getOrCreateLabel.js';
import { parseTrackPosition } from '../utils/parseTrackPosition.js';

export const addRelease = async (payload, connection) => {
  const conn = connection;

  try {
    const {
      release,
      image_filename,
      thumbnail_url,
      artists,
      labels,
      genres,
      styles,
      links,
      tracks,
    } = payload;

    // -----------------
    // Insert release
    // -----------------
    const [result] = await conn.query(
      `
        INSERT INTO releases
        (discogs_id, title, year, country, barcode, notes, release_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [
        release.discogs_id || null,
        release.title,
        release.year,
        release.country,
        release.barcode,
        release.notes,
        release.release_type,
      ],
    );

    const releaseId = result.insertId;

    // -----------------
    // image
    // -----------------
    if (image_filename) {
      await conn.query(
        `
        INSERT INTO image
        (entity_type, entity_id, type, url, thumbnail_url)
        VALUES ('release', ?, 'cover', ?, ?)
        `,
        [releaseId, image_filename, thumbnail_url || null],
      );
    }

    // -----------------
    // artist
    // -----------------

    const insertedArtists = new Set();

    for (const artist of artists || []) {
      const artistId = await getOrCreateArtist(conn, artist);

      const role = artist.role || 'Main';
      const key = `${artistId}-${role}`;

      if (insertedArtists.has(key)) continue;

      insertedArtists.add(key);

      await conn.query(
        `
    INSERT INTO release_artist (release_id, artist_id, role)
    VALUES (?, ?, ?)
    `,
        [releaseId, artistId, role],
      );
    }

    // -----------------
    // Label
    // -----------------

    for (const label of labels || []) {
      const labelId = await getOrCreateLabel(conn, label);

      await conn.query(
        `
    INSERT INTO release_label (release_id, label_id, catalog_number)
    VALUES (?, ?, ?)
    `,
        [releaseId, labelId, label.catalog_number || null],
      );
    }

    // -----------------
    // genre
    // -----------------

    for (const genre of genres || []) {
      let genreId = genre.id;

      if (!genreId) {
        const [existing] = await conn.query(`SELECT id FROM genre WHERE name = ?`, [genre.name]);

        if (existing.length) genreId = existing[0].id;
        else {
          const [created] = await conn.query(`INSERT INTO genre (name) VALUES (?)`, [genre.name]);
          genreId = created.insertId;
        }
      }

      await conn.query(
        `
    INSERT INTO release_genre (release_id, genre_id)
    VALUES (?, ?)
  `,
        [releaseId, genreId],
      );
    }

    // -----------------
    // style
    // -----------------

    for (const style of styles || []) {
      let styleId = style.id;

      if (!styleId) {
        const [existing] = await conn.query(`SELECT id FROM style WHERE name = ?`, [style.name]);

        if (existing.length) styleId = existing[0].id;
        else {
          const [created] = await conn.query(`INSERT INTO style (name) VALUES (?)`, [style.name]);
          styleId = created.insertId;
        }
      }

      await conn.query(
        `
    INSERT INTO release_style (release_id, style_id)
    VALUES (?, ?)
  `,
        [releaseId, styleId],
      );
    }

    // -----------------
    // link
    // -----------------
    for (const link of links || []) {
      if (!link.platform || !link.url) continue;

      await conn.query(
        `
    INSERT INTO external_link
    (entity_type, entity_id, platform, url)
    VALUES ('release', ?, ?, ?)
  `,
        [releaseId, link.platform, link.url],
      );
    }

    // -----------------
    // tracks
    // -----------------

    if (tracks && tracks.length > 0) {
      const discCache = {};
      const sideCache = {};

      for (const track of tracks) {
        if (track.type_ && track.type_ !== 'track') continue;

        const parsed = parseTrackPosition(track.position);

        if (!parsed) continue;

        const { disc, side } = parsed;

        if (!side) continue;

        // ---------- DISC ----------
        let discId = discCache[disc];

        if (!discId) {
          const [discResult] = await conn.query(
            `
          INSERT INTO disc
          (release_id, disc_number, format, size, speed)
          VALUES (?, ?, ?, ?, ?)
            `,
            [
              releaseId,
              disc,
              payload.disc.format || null,
              payload.disc.size || null,
              payload.disc.speed ? parseInt(payload.disc.speed) : null,
            ],
          );

          discId = discResult.insertId;
          discCache[disc] = discId;
        }

        // ---------- SIDE ----------
        const sideKey = `${discId}-${side}`;
        let sideId = sideCache[sideKey];

        if (!sideId) {
          const [sideResult] = await conn.query(
            `
        INSERT INTO side (disc_id, name)
        VALUES (?, ?)
        `,
            [discId, side],
          );

          sideId = sideResult.insertId;
          sideCache[sideKey] = sideId;
        }

        // ---------- TRACK ----------
        await conn.query(
          `
      INSERT INTO track (side_id, position, title, duration)
      VALUES (?, ?, ?, ?)
      `,
          [sideId, track.position || null, track.title || null, track.duration || null],
        );
      }
    }

    // -----------------
    // Return
    // -----------------

    return { id: releaseId };
  } finally {
    conn.release();
  }
};

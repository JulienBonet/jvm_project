// server\src\utils\getOrCreateArtist.js

import * as artistModels from '../models/artistModels.js';

const DEFAULT_ARTIST_IMAGE = '00_artist_default';

export async function getOrCreateArtist(connection, artist) {
  // 1️⃣ si id déjà présent
  if (artist.id) {
    return artist.id;
  }

  // 2️⃣ chercher par nom
  const existing = await artistModels.findArtistByName(connection, artist.name);

  if (existing) {
    return existing.id;
  }

  // 3️⃣ création via ton model existant
  const artistId = await artistModels.addArtistWithImage({
    connection,
    name: artist.name,
    sorted_name: artist.sorted_name || artist.name,
    discogs_id: artist.discogs_id || null,
    image_filename: DEFAULT_ARTIST_IMAGE,
  });

  return artistId;
}

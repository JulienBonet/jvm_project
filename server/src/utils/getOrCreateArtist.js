// server\src\utils\getOrCreateArtist.js
import * as artistModels from '../models/artistModels.js';
import { uploadBufferToCloudinary } from './cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinaryFolders.js';

const DEFAULT_ARTIST_IMAGE = '00_artist_default';

// export async function getOrCreateArtist(connection, artist) {
//   // 1️⃣ si id déjà présent
//   if (artist.id) return artist.id;

//   // ✅ 2️⃣ PRIORITÉ : discogs_id
//   if (artist.discogs_id) {
//     const existingByDiscogs = await artistModels.findArtistByDiscogsId(
//       connection,
//       artist.discogs_id,
//     );

//     if (existingByDiscogs) {
//       return existingByDiscogs.id;
//     }
//   }

//   // 3️⃣ fallback : name
//   const existingByName = await artistModels.findArtistByName(connection, artist.name);

//   if (existingByName) {
//     return existingByName.id;
//   }

//   // 4️⃣ création
//   let imageFilename = DEFAULT_ARTIST_IMAGE;

//   if (artist.thumbnail_url) {
//     const response = await fetch(artist.thumbnail_url);
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     imageFilename = await uploadBufferToCloudinary({
//       buffer,
//       folder: CLOUDINARY_FOLDERS.ARTIST,
//       prefix: 'artist',
//     });
//   }

//   const artistId = await artistModels.addArtistWithImage({
//     connection,
//     name: artist.name,
//     sorted_name: artist.sorted_name || artist.name,
//     discogs_id: artist.discogs_id || null,
//     image_filename: imageFilename,
//   });

//   return artistId;
// }

export async function getOrCreateArtist(connection, artist) {
  if (artist.id) return artist.id;

  let existing = null;

  // 1️⃣ PRIORITÉ : discogs_id
  if (artist.discogs_id) {
    existing = await artistModels.findArtistByDiscogsId(connection, artist.discogs_id);
  }

  // 2️⃣ fallback : name
  if (!existing) {
    existing = await artistModels.findArtistByName(connection, artist.name);
  }

  // 🔥 3️⃣ SI EXISTE → ENRICHIR
  if (existing) {
    const needsImage = !existing.image_url || existing.image_url === DEFAULT_ARTIST_IMAGE;

    const needsDiscogsId = !existing.discogs_id && artist.discogs_id;

    // 🔥 récupérer image Discogs si absente
    if (needsImage && artist.discogs_id) {
      const response = await fetch(`https://api.discogs.com/artists/${artist.discogs_id}`);
      const data = await response.json();

      const imageUrl = data.images?.[0]?.uri;

      if (imageUrl) {
        const buffer = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());

        const imageFilename = await uploadBufferToCloudinary({
          buffer,
          folder: CLOUDINARY_FOLDERS.ARTIST,
          prefix: 'artist',
        });

        await artistModels.updateArtistImage(connection, existing.id, imageFilename);
      }
    }

    // 🔥 ajouter discogs_id si manquant
    if (needsDiscogsId) {
      await artistModels.updateArtistDiscogsId(connection, existing.id, artist.discogs_id);
    }

    return existing.id;
  }

  // 🆕 4️⃣ CREATE
  let imageFilename = DEFAULT_ARTIST_IMAGE;

  if (artist.thumbnail_url) {
    const response = await fetch(artist.thumbnail_url);
    const buffer = Buffer.from(await response.arrayBuffer());

    imageFilename = await uploadBufferToCloudinary({
      buffer,
      folder: CLOUDINARY_FOLDERS.ARTIST,
      prefix: 'artist',
    });
  }

  const artistId = await artistModels.addArtistWithImage({
    connection,
    name: artist.name,
    sorted_name: artist.sorted_name || artist.name,
    discogs_id: artist.discogs_id || null,
    image_filename: imageFilename,
  });

  return artistId;
}

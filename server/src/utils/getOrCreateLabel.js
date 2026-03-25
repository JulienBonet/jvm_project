// server\src\utils\getOrCreateLabel.js

import * as labelModels from '../models/labelModels.js';
import { uploadBufferToCloudinary } from './cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinaryFolders.js';

const DEFAULT_LABEL_IMAGE = '00_label_default';

// export async function getOrCreateLabel(connection, label) {
//   // 1️⃣ si id déjà présent
//   if (label.id) {
//     return label.id;
//   }

//   // ✅ 2️⃣ chercher par discogs_id EN PRIORITÉ
//   if (label.discogs_id) {
//     const existingByDiscogs = await labelModels.findLabelByDiscogsId(connection, label.discogs_id);

//     if (existingByDiscogs) {
//       return existingByDiscogs.id;
//     }
//   }

//   // 3️⃣ fallback sur le nom
//   const existingByName = await labelModels.findLabelByName(connection, label.name);

//   if (existingByName) {
//     return existingByName.id;
//   }

//   // 4️⃣ création
//   let imageFilename = DEFAULT_LABEL_IMAGE;

//   if (label.thumbnail_url) {
//     const response = await fetch(label.thumbnail_url);
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     imageFilename = await uploadBufferToCloudinary({
//       buffer,
//       folder: CLOUDINARY_FOLDERS.LABEL,
//       prefix: 'label',
//     });
//   }

//   const labelId = await labelModels.addLabelWithImage({
//     connection,
//     name: label.name,
//     sorted_name: label.sorted_name || label.name,
//     discogs_id: label.discogs_id || null,
//     image_filename: imageFilename,
//   });

//   return labelId;
// }

export async function getOrCreateLabel(connection, label) {
  // 1️⃣ Si id déjà présent → retourne
  if (label.id) return label.id;

  let existing = null;

  // 2️⃣ Priorité : discogs_id
  if (label.discogs_id) {
    existing = await labelModels.findLabelByDiscogsId(connection, label.discogs_id);
  }

  // 3️⃣ Fallback : name
  if (!existing) {
    existing = await labelModels.findLabelByName(connection, label.name);
  }

  // 4️⃣ Si existant → enrichir si besoin
  if (existing) {
    const needsImage = !existing.image_url || existing.image_url === DEFAULT_LABEL_IMAGE;
    const needsDiscogsId = !existing.discogs_id && label.discogs_id;

    // 🔥 Récupérer image Discogs si absente
    if (needsImage && label.discogs_id) {
      try {
        const res = await fetch(`https://api.discogs.com/labels/${label.discogs_id}`);
        const data = await res.json();
        const imageUrl = data.images?.[0]?.uri;

        if (imageUrl) {
          const buffer = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());

          // Upload sur Cloudinary
          const imageFilename = await uploadBufferToCloudinary({
            buffer,
            folder: CLOUDINARY_FOLDERS.LABEL,
            prefix: 'label',
          });

          // Enregistrer dans ta table image (relation label → image)
          await labelModels.addOrUpdateLabelImage(connection, existing.id, imageFilename);
        }
      } catch (err) {
        console.warn('Erreur récupération image Discogs label', err);
      }
    }

    // 🔥 Ajouter discogs_id si manquant
    if (needsDiscogsId) {
      await labelModels.updateLabelDiscogsId(connection, existing.id, label.discogs_id);
    }

    return existing.id;
  }

  // 5️⃣ Si nouveau → créer
  let imageFilename = DEFAULT_LABEL_IMAGE;

  if (label.thumbnail_url) {
    try {
      const buffer = Buffer.from(await (await fetch(label.thumbnail_url)).arrayBuffer());

      imageFilename = await uploadBufferToCloudinary({
        buffer,
        folder: CLOUDINARY_FOLDERS.LABEL,
        prefix: 'label',
      });
    } catch (err) {
      console.warn('Erreur upload thumbnail label', err);
    }
  }

  const labelId = await labelModels.addLabelWithImage({
    connection,
    name: label.name,
    sorted_name: label.sorted_name || label.name,
    discogs_id: label.discogs_id || null,
    image_filename: imageFilename,
  });

  return labelId;
}

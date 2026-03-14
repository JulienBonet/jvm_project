// server\src\utils\getOrCreateLabel.js

import * as labelModels from '../models/labelModels.js';

const DEFAULT_LABEL_IMAGE = '00_label_default';

export async function getOrCreateLabel(connection, label) {
  if (label.id) {
    return label.id;
  }

  const existing = await labelModels.findLabelByName(connection, label.name);

  if (existing) {
    return existing.id;
  }

  const labelId = await labelModels.addLabelWithImage({
    connection,
    name: label.name,
    sorted_name: label.sorted_name || label.name,
    discogs_id: label.discogs_id || null,
    image_filename: DEFAULT_LABEL_IMAGE,
  });

  return labelId;
}

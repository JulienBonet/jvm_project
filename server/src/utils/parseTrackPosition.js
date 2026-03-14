export function parseTrackPosition(position) {
  if (!position) {
    return {
      disc: 1,
      side: null,
      position: null,
    };
  }

  const clean = position.trim().toUpperCase();

  /*
  CAS POSSIBLES :
  A1
  A
  AA1
  A1A
  CD1-1
  1-1
  */

  // CD1-1
  let match = clean.match(/^CD(\d+)-(\d+)/);
  if (match) {
    return {
      disc: Number(match[1]),
      side: 'X', // ← ici on met un side par défaut
      position: clean,
    };
  }

  // 1-1
  match = clean.match(/^(\d+)-(\d+)/);
  if (match) {
    return {
      disc: Number(match[1]),
      side: 'X', // ← side par défaut
      position: clean,
    };
  }

  // A1 / AA1 / A / A1A
  match = clean.match(/^([A-Z]+)(\d*)/);
  if (match) {
    const side = match[1];

    // calcul disc implicite
    const sideIndex = side.charCodeAt(0) - 'A'.charCodeAt(0);

    const disc = Math.floor(sideIndex / 2) + 1;

    return {
      disc,
      side,
      position: clean,
    };
  }

  return {
    disc: 1,
    side: null,
    position: clean,
  };
}

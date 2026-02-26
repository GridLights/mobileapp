// presetNames.js
// Generates random new-age preset names in the form "[Adjective] [Adjective] [Noun]".
// Word lists live in presetWords.json — edit that file to add or swap vocabulary.

import words from './presetWords.json';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random preset name: "[Adjective] [Adjective] [Noun]"
 * @returns {string}
 */
export function generatePresetName() {
  let adj1 = pick(words.adjectives);
  let adj2;
  do { adj2 = pick(words.adjectives); } while (adj2 === adj1);
  const noun = pick(words.nouns);
  return `${adj1} ${adj2} ${noun}`;
}

/**
 * Generate a random playlist name: "Playlist [Adjective] [Noun]"
 * @returns {string}
 */
export function generatePlaylistName() {
  const adj = pick(words.adjectives);
  const noun = pick(words.nouns);
  return `Playlist ${adj} ${noun}`;
}

// Base URL of the PokéAPI (public, no API key required).
export const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Number of Pokémon requested per page of the list.
export const PAGE_SIZE = 20;

// Highest possible base stat value; stat bars are drawn relative to it.
export const STAT_MAX = 255;

const ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Builds the official artwork URL from the id, so the image works even when the API omits it.
export function buildArtworkUrl(id) {
  return `${ARTWORK_BASE_URL}/${id}.png`;
}

// Fixed, generous limit for the single request that fetches every Pokémon name (the catalogue is smaller).
export const INDEX_LIMIT = 2000;

// Maximum number of tiles in the search results list.
export const MAX_RESULTS = 100;

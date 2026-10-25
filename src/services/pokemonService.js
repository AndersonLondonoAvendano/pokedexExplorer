// The only module that talks to the PokéAPI. Every function returns clean
// models built by the private mappers below, so the raw JSON never leaves
// this file and the rest of the app does not depend on the API's shape.

import { API_BASE_URL, INDEX_LIMIT, PAGE_SIZE, buildArtworkUrl } from '../config/api.js';
import {
  decimetersToMeters,
  extractIdFromUrl,
  hectogramsToKilograms,
  isNumericQuery,
  normalizeQuery,
} from '../utils/formatters.js';
import { HttpError, NotFoundError } from './apiErrors.js';

// [CONCEPT] async/await: the request reads top to bottom like synchronous code,
// and any rejection (network failure, abort, HTTP error) propagates to the caller's try/catch.
async function request(url, signal) {
  // [CONCEPT] fetch: the native HTTP client of React Native; no extra library is needed to call a public REST API.
  // [CONCEPT] AbortController: the caller owns the controller and passes only its signal here,
  // so a newer search or an unmounted view can cancel this request; fetch then rejects with AbortError.
  const response = await fetch(url, { signal });

  // [CONCEPT] response.ok: fetch only rejects on network failures, so the HTTP status is checked
  // before reading the body; an error response is never parsed as if it were Pokémon data.
  if (!response.ok) {
    if (response.status === 404) {
      throw new NotFoundError(`Resource not found: ${url}`);
    }
    throw new HttpError(response.status);
  }

  return response.json();
}

// Uses the official artwork when the API provides it; otherwise builds the
// same URL from the id so every Pokémon still gets an image.
function pickImageUrl(sprites, id) {
  return sprites?.other?.['official-artwork']?.front_default ?? buildArtworkUrl(id);
}

// List entries only carry name and URL; the id comes from the URL and the
// image is derived from the id, so the list needs one request per page.
function mapListItem(entry) {
  const id = extractIdFromUrl(entry.url);
  return { id, name: entry.name, imageUrl: buildArtworkUrl(id) };
}

// Keeps only what the detail view shows. Units are converted to meters and
// kilograms as numbers; formatting for display happens in the view.
function mapPokemonDetail(data) {
  return {
    id: data.id,
    name: data.name,
    imageUrl: pickImageUrl(data.sprites, data.id),
    heightMeters: decimetersToMeters(data.height),
    weightKilograms: hectogramsToKilograms(data.weight),
    types: [...data.types].sort((a, b) => a.slot - b.slot).map((entry) => entry.type.name),
    stats: data.stats.map((entry) => ({ name: entry.stat.name, value: entry.base_stat })),
  };
}

// One page of the Pokédex. `nextOffset` is null on the last page, which tells
// the list to stop asking for more; `total` is the size of the whole catalogue.
export async function fetchPokemonPage({ offset = 0, limit = PAGE_SIZE, signal } = {}) {
  const data = await request(`${API_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`, signal);
  const items = data.results.map(mapListItem);
  return {
    items,
    nextOffset: data.next ? offset + items.length : null,
    total: data.count,
  };
}

// A single Pokémon by number or by name. Accepts the raw search text: it is
// normalized here so every caller gets the same behavior.
export async function fetchPokemonDetail(idOrName, signal) {
  const term = normalizeQuery(idOrName);
  // [CONCEPT] encodeURIComponent: a typed name may contain spaces or symbols that would break the URL path;
  // a number is already URL-safe, so it is sent as is.
  const segment = isNumericQuery(term) ? term : encodeURIComponent(term);
  const data = await request(`${API_BASE_URL}/pokemon/${segment}`, signal);
  return mapPokemonDetail(data);
}

// Every Pokémon name with its id and image, in one request. The id comes from each
// resource URL, never from the position, so the order the API returns does not matter.
export async function fetchPokemonIndex({ signal } = {}) {
  const data = await request(`${API_BASE_URL}/pokemon?limit=${INDEX_LIMIT}&offset=0`, signal);
  return data.results.map(mapListItem);
}

// Every text the user reads, in Spanish, in one place. Views and hooks import
// from here instead of writing literals, so the wording stays consistent.
import { formatNumber } from '../utils/formatters.js';

export const STRINGS = {
  // Header
  appTitle: 'PokéDex Explorer',
  // Total comes from the API; formatNumber gives '1.351' on every device.
  subtitle: (total) => `Guía de campo de ${formatNumber(total)} Pokémon`,

  // Search
  searchPlaceholder: 'Busca por nombre o número...',
  searchLabel: 'Buscar Pokémon por nombre o número', // accessibilityLabel of the input
  searchButton: 'Buscar',

  // Actions
  retryButton: 'Reintentar',
  backButton: 'Volver a la lista',

  // Loading states (three plain dots, not the ellipsis character)
  loadingList: 'Cargando Pokémon...',
  loadingMore: 'Cargando más Pokémon...',
  loadingSearch: 'Buscando...',
  loadingDetail: 'Cargando ficha...',

  // Error and empty states: never technical details
  errorGeneric: 'No pudimos conectar con la PokéAPI. Revisa tu conexión e inténtalo de nuevo.',
  searchNotFound: (query) => `No encontramos ningún Pokémon llamado “${query}”.`,

  // Accessibility labels
  cardLabel: (name, id) => `${name}, número ${id}`, // list tile
  typeLabel: (label) => `Tipo ${label}`, // type badge
  statLabel: (label, value) => `${label} ${value} de 255`, // stat bar

  // Detail
  statsTitle: 'Estadísticas base',
  heightLabel: 'Altura',
  weightLabel: 'Peso',
  meters: 'm',
  kilograms: 'kg',
};

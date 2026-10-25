import { useCallback, useEffect, useRef, useState } from 'react';

import { MAX_RESULTS } from '../config/api.js';
import { fetchPokemonDetail, fetchPokemonIndex } from '../services/pokemonService.js';
import { HttpError, NotFoundError, isAbortError } from '../services/apiErrors.js';
import { hyphenateSpaces, normalizeQuery } from '../utils/formatters.js';
import { resolveMatches, searchKind } from '../utils/searchMatch.js';

// Searches Pokémon by name or number. `status` is 'idle' | 'loading' | 'empty' | 'error'.
// A number or a single character asks the API for that exact Pokémon; longer text is matched
// against the name index, which is requested once per session and only when a search needs it.
// A single Pokémon found (exact request, exact name or only match) is not stored here: its id goes
// to `onFound` and the status returns to 'idle'. Two or more matches go to `results`
// ({ items, total, term, version }), which any other outcome closes (null).
// 'empty' means the term matches nothing; every other failure is 'error'.
// No error object, message or HTTP code leaves this hook.
export function usePokemonSearch({ onFound } = {}) {
  // [CONCEPT] useState: the status, the last searched term and the results live in state, so React
  // re-renders the search UI when a request starts, finds nothing, fails or yields a list.
  const [status, setStatus] = useState('idle');
  // Normalized term without hyphens (what the user typed), kept for the UI and for retry.
  const [lastQuery, setLastQuery] = useState('');
  const [results, setResults] = useState(null);

  // [CONCEPT] useRef: refs change synchronously and do not cause renders. They hold the
  // controller of the request in flight, the flags that retry must read without waiting for a render
  // and the name index, a session cache that survives re-renders.
  const controllerRef = useRef(null);
  const isFetchingRef = useRef(false);
  // Set synchronously when a request fails, before the state changes, so a retry made
  // from an older render never repeats a request that did not fail.
  const failedRef = useRef(false);
  const lastQueryRef = useRef('');
  // Name index of the session: written only after a current, successful response.
  const indexRef = useRef(null);
  // Grows with every new list, so the view can restart its scroll when the results are replaced.
  const versionRef = useRef(0);

  // The latest callback is read from a ref, so a new function identity on every render
  // of the parent does not change `search` or `retry`.
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;

  // Cancels the request in flight, if any, and clears the flags that describe it.
  const cancelRequest = useCallback(() => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = null;
    isFetchingRef.current = false;
    failedRef.current = false;
  }, []);

  // Applies a partial match against the index: open one Pokémon, nothing, or a list.
  const applyIndex = useCallback((index, term, query) => {
    const match = resolveMatches(index, term, MAX_RESULTS);
    if (match.kind === 'list') {
      versionRef.current += 1;
      setResults({ items: match.items, total: match.total, term: query, version: versionRef.current });
      setStatus('idle');
      return;
    }
    setResults(null);
    if (match.kind === 'open') {
      setStatus('idle');
      if (onFoundRef.current) onFoundRef.current(match.id);
    } else {
      setStatus('empty');
    }
  }, []);

  // Runs one search for an already normalized term, replacing any request in flight.
  const runSearch = useCallback(async (query) => {
    const term = hyphenateSpaces(query);
    const isIndexSearch = searchKind(term) === 'partial';

    // With the index in memory the search resolves at once: no request and no 'loading'.
    if (isIndexSearch && indexRef.current) {
      cancelRequest();
      applyIndex(indexRef.current, term, query);
      return;
    }

    // [CONCEPT] AbortController: one controller per search; starting another one (or
    // resetting, or unmounting) aborts this one, so a late response never reaches the UI.
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    isFetchingRef.current = true;
    failedRef.current = false;
    setStatus('loading');

    // [CONCEPT] async/await: the request is awaited inside try/catch so each failure
    // becomes a status instead of an unhandled rejection.
    try {
      if (isIndexSearch) {
        const index = await fetchPokemonIndex({ signal: controller.signal });
        // A response that arrives right before the abort must not be used or cached.
        if (controller.signal.aborted || controllerRef.current !== controller) return;
        indexRef.current = index;
        isFetchingRef.current = false;
        applyIndex(index, term, query);
      } else {
        const pokemon = await fetchPokemonDetail(term, controller.signal);
        if (controller.signal.aborted || controllerRef.current !== controller) return;
        isFetchingRef.current = false;
        setResults(null);
        setStatus('idle');
        if (onFoundRef.current) onFoundRef.current(pokemon.id);
      }
    } catch (error) {
      // A cancelled or replaced request is expected: nothing changes.
      if (isAbortError(error) || controller.signal.aborted || controllerRef.current !== controller) return;
      isFetchingRef.current = false;
      setResults(null);
      // Only the exact request reads 404 and 400 as "no match"; any index failure is an error.
      const isNoMatch =
        !isIndexSearch &&
        (error instanceof NotFoundError || (error instanceof HttpError && error.status === 400));
      if (isNoMatch) {
        setStatus('empty');
      } else {
        failedRef.current = true;
        setStatus('error');
      }
    }
  }, [applyIndex, cancelRequest]);

  // Starts a search for the raw text of the input.
  const search = useCallback((raw) => {
    const query = normalizeQuery(raw);
    if (query === '') {
      // Nothing to look for: no request, any pending one is dropped and the results close.
      cancelRequest();
      setResults(null);
      setStatus('idle');
      return;
    }
    lastQueryRef.current = query;
    setLastQuery(query);
    runSearch(query);
  }, [cancelRequest, runSearch]);

  // Repeats the last search. Only acts after a real failure and when no request is running.
  const retry = useCallback(() => {
    if (isFetchingRef.current) return;
    if (!failedRef.current) return;
    runSearch(lastQueryRef.current);
  }, [runSearch]);

  // Cancels any request and goes back to 'idle'; the results stay as they are.
  const reset = useCallback(() => {
    cancelRequest();
    setStatus('idle');
  }, [cancelRequest]);

  // Like reset, and also closes the results (back to the full list).
  const clearResults = useCallback(() => {
    cancelRequest();
    setResults(null);
    setStatus('idle');
  }, [cancelRequest]);

  // [CONCEPT] useEffect cleanup: with no dependencies it runs once; its cleanup aborts the
  // request in flight when the screen unmounts, so no state is set on an unmounted component.
  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  return { status, retry, lastQuery, results, search, reset, clearResults };
}

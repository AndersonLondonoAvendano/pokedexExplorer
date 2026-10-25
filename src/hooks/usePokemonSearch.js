import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchPokemonDetail } from '../services/pokemonService.js';
import { HttpError, NotFoundError, isAbortError } from '../services/apiErrors.js';
import { hyphenateSpaces, normalizeQuery } from '../utils/formatters.js';

// Searches one Pokémon by name or number. `status` is 'idle' | 'loading' | 'empty' | 'error'.
// A found Pokémon is not stored here: its id goes to `onFound` and the status returns to 'idle'.
// 'empty' means the term matches nothing (404, or 400 for a term the API cannot parse);
// every other failure is 'error'. No error object, message or HTTP code leaves this hook.
export function usePokemonSearch({ onFound } = {}) {
  // [CONCEPT] useState: the status and the last searched term live in state, so React
  // re-renders the search UI when a request starts, finds nothing or fails.
  const [status, setStatus] = useState('idle');
  // Normalized term without hyphens (what the user typed), kept for the UI and for retry.
  const [lastQuery, setLastQuery] = useState('');

  // [CONCEPT] useRef: refs change synchronously and do not cause renders. They hold the
  // controller of the request in flight and the flags that retry must read without waiting for a render.
  const controllerRef = useRef(null);
  const isFetchingRef = useRef(false);
  // Set synchronously when a request fails, before the state changes, so a retry made
  // from an older render never repeats a request that did not fail.
  const failedRef = useRef(false);
  const lastQueryRef = useRef('');

  // The latest callback is read from a ref, so a new function identity on every render
  // of the parent does not change `search` or `retry`.
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;

  // Runs one request for an already normalized term, replacing any request in flight.
  const runSearch = useCallback(async (query) => {
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
      const pokemon = await fetchPokemonDetail(hyphenateSpaces(query), controller.signal);
      // A response that arrives right before the abort must not be used.
      if (controller.signal.aborted || controllerRef.current !== controller) return;
      isFetchingRef.current = false;
      setStatus('idle');
      if (onFoundRef.current) onFoundRef.current(pokemon.id);
    } catch (error) {
      // A cancelled or replaced request is expected: nothing changes.
      if (isAbortError(error) || controller.signal.aborted || controllerRef.current !== controller) return;
      isFetchingRef.current = false;
      const isNoMatch = error instanceof NotFoundError || (error instanceof HttpError && error.status === 400);
      if (isNoMatch) {
        setStatus('empty');
      } else {
        failedRef.current = true;
        setStatus('error');
      }
    }
  }, []);

  // Starts a search for the raw text of the input.
  const search = useCallback((raw) => {
    const query = normalizeQuery(raw);
    if (query === '') {
      // Nothing to look for: no request, and any pending one is dropped.
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = null;
      isFetchingRef.current = false;
      failedRef.current = false;
      setStatus('idle');
      return;
    }
    lastQueryRef.current = query;
    setLastQuery(query);
    runSearch(query);
  }, [runSearch]);

  // Repeats the last search. Only acts after a real failure and when no request is running.
  const retry = useCallback(() => {
    if (isFetchingRef.current) return;
    if (!failedRef.current) return;
    runSearch(lastQueryRef.current);
  }, [runSearch]);

  // Cancels any request and goes back to 'idle' (for example when the input is cleared).
  const reset = useCallback(() => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = null;
    isFetchingRef.current = false;
    failedRef.current = false;
    setStatus('idle');
  }, []);

  // [CONCEPT] useEffect cleanup: with no dependencies it runs once; its cleanup aborts the
  // request in flight when the screen unmounts, so no state is set on an unmounted component.
  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  return { status, retry, lastQuery, search, reset };
}

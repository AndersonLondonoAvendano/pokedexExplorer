import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchPokemonDetail } from '../services/pokemonService.js';
import { isAbortError } from '../services/apiErrors.js';

// Loads one Pokémon by id. `status` is 'loading' | 'success' | 'error' and
// `pokemon` is null until a request succeeds. Every failure that is not a
// cancellation (network, 5xx, and also 400 or 404) is just 'error': no error
// object, message or HTTP code leaves this hook, so the view can only show its
// own Spanish texts.
export function usePokemonDetail(pokemonId) {
  // [CONCEPT] useState: the status and the loaded Pokémon live in state, so React
  // re-renders the detail view when the request finishes or fails.
  const [attempt, setAttempt] = useState(0);
  // The outcome is stored together with the id and attempt it belongs to, so a
  // render that already has a new id can never pair it with the previous result.
  const [outcome, setOutcome] = useState({ forId: pokemonId, forAttempt: 0, status: 'loading', pokemon: null });

  // A ref changes synchronously: a double tap on "retry" can run twice before the
  // re-render that would show the request in progress, and this flag blocks the
  // second call immediately.
  const isFetchingRef = useRef(false);

  // Set synchronously when a request fails, before the state changes. A retry
  // call made from an older render would otherwise see a stale 'error' (or
  // 'loading') status and bump `attempt` with no failed request to repeat.
  const failedRef = useRef(false);

  // [CONCEPT] useEffect: depends only on `pokemonId` and `attempt`, two primitives that change only when
  // the user opens another Pokémon or presses retry; the effect never sets either of them, so it cannot
  // trigger itself and the request is made once per id/retry instead of looping.
  useEffect(() => {
    // [CONCEPT] AbortController: one controller per request; the cleanup aborts it when the view
    // unmounts or the id changes, so a response for an old id never updates the state.
    const controller = new AbortController();
    isFetchingRef.current = true;
    failedRef.current = false;
    // Never show the previous Pokémon under a new id (or while retrying).
    setOutcome({ forId: pokemonId, forAttempt: attempt, status: 'loading', pokemon: null });

    // [CONCEPT] async/await: the request is awaited inside a try/catch so a network or HTTP
    // failure becomes an 'error' status instead of an unhandled rejection.
    async function loadPokemon() {
      try {
        const loaded = await fetchPokemonDetail(pokemonId, controller.signal);
        // A response that arrives right before the abort must not overwrite the newer request.
        if (controller.signal.aborted) return;
        setOutcome({ forId: pokemonId, forAttempt: attempt, status: 'success', pokemon: loaded });
      } catch (error) {
        // A cancelled request is expected (unmount or another id): nothing changes.
        if (isAbortError(error) || controller.signal.aborted) return;
        failedRef.current = true;
        setOutcome({ forId: pokemonId, forAttempt: attempt, status: 'error', pokemon: null });
      } finally {
        // An aborted request leaves the flag to the request that replaced it.
        if (!controller.signal.aborted) {
          isFetchingRef.current = false;
        }
      }
    }

    loadPokemon();

    return () => controller.abort();
  }, [pokemonId, attempt]);

  // In the render where the id or attempt has just changed, the effect has not
  // run yet and `outcome` still describes the old request: report 'loading'.
  const isCurrent = outcome.forId === pokemonId && outcome.forAttempt === attempt;
  const status = isCurrent ? outcome.status : 'loading';
  const pokemon = isCurrent ? outcome.pokemon : null;

  // Repeats the failed request. Only acts when a request really failed and none
  // is running; bumping `attempt` is what makes the effect run again for the same id.
  const retry = useCallback(() => {
    if (isFetchingRef.current) return;
    if (!failedRef.current) return;
    isFetchingRef.current = true;
    failedRef.current = false;
    setAttempt((count) => count + 1);
  }, []);

  return { status, retry, pokemon };
}

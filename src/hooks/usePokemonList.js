import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchPokemonPage } from '../services/pokemonService.js';
import { isAbortError } from '../services/apiErrors.js';

// The first page always starts at the beginning of the Pokédex.
const FIRST_OFFSET = 0;

// Appends a page to the list, skipping any id that is already there, so a
// repeated or overlapping page never shows the same Pokémon twice.
function appendUnique(currentItems, pageItems) {
  const knownIds = new Set(currentItems.map((item) => item.id));
  const newItems = pageItems.filter((item) => !knownIds.has(item.id));
  return newItems.length ? [...currentItems, ...newItems] : currentItems;
}

// Paginated Pokédex list. `status` describes the first page (full-screen
// states); `footerStatus` describes the following pages (shown at the end of
// the list) so a failed page keeps every Pokémon already loaded.
// Errors are reduced to a status: no error object, message or HTTP code
// leaves this hook, so the view can only show its own Spanish texts.
export function usePokemonList() {
  // [CONCEPT] useState: each value that changes what the list shows lives in state,
  // so React re-renders the view when a page arrives or a request fails.
  const [offset, setOffset] = useState(FIRST_OFFSET);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('loading');
  const [footerStatus, setFooterStatus] = useState('idle');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [nextOffset, setNextOffset] = useState(FIRST_OFFSET);

  // A ref changes synchronously: the end-of-list event can fire several times
  // before the re-render that would show the request in progress, and this flag
  // blocks those extra calls immediately.
  const isFetchingRef = useRef(false);

  // Set synchronously when a page fails, before React re-renders. A late
  // end-of-list call that still holds an older render would otherwise see a
  // stale 'loading' footer, pass its guards and restart a request that nobody
  // performs. The effect clears it when a new request (retry) starts.
  const pageFailedRef = useRef(false);

  // Live mirror of the next offset to request (null when no pages remain). A
  // stale loadMore reads this instead of the offset captured in its closure,
  // so it can never ask again for a page that was already requested.
  const nextOffsetRef = useRef(FIRST_OFFSET);

  // [CONCEPT] useEffect: depends only on `offset` (the page requested) and `attempt` (bumped by retry),
  // two numbers that change only when the user scrolls to the end or presses retry; the effect never
  // sets either of them, so it cannot trigger itself and each page is requested once instead of looping.
  useEffect(() => {
    // [CONCEPT] AbortController: one controller per page request; the cleanup aborts it when the
    // list unmounts or a new page/retry replaces it, so a stale response never updates the state.
    const controller = new AbortController();
    const isFirstPage = offset === FIRST_OFFSET;
    isFetchingRef.current = true;
    pageFailedRef.current = false;

    // [CONCEPT] async/await: the page request is awaited inside a try/catch so a network or HTTP
    // failure becomes an 'error' status instead of an unhandled rejection.
    async function loadPage() {
      try {
        const page = await fetchPokemonPage({ offset, signal: controller.signal });
        setItems((currentItems) => appendUnique(currentItems, page.items));
        setTotal(page.total);
        nextOffsetRef.current = page.nextOffset;
        setNextOffset(page.nextOffset);
        if (isFirstPage) {
          setStatus('success');
        } else {
          setFooterStatus('idle');
        }
      } catch (error) {
        // A cancelled request is expected (unmount or replaced page): nothing changes.
        if (isAbortError(error)) return;
        pageFailedRef.current = true;
        // Any other failure, including a 400 or 404 response, is a load error for the list.
        if (isFirstPage) {
          setStatus('error');
        } else {
          setFooterStatus('error');
        }
      } finally {
        // An aborted request leaves the flag to the request that replaced it.
        if (!controller.signal.aborted) {
          isFetchingRef.current = false;
        }
      }
    }

    loadPage();

    return () => controller.abort();
  }, [offset, attempt]);

  const hasMore = nextOffset !== null;

  // useCallback keeps the same function between renders while its inputs do not
  // change, so the list can receive it as `onEndReached` without being handed a
  // new function on every render.
  const loadMore = useCallback(() => {
    if (isFetchingRef.current) return;
    if (pageFailedRef.current) return;
    if (status !== 'success') return;
    const offsetToLoad = nextOffsetRef.current;
    if (offsetToLoad === null) return;
    isFetchingRef.current = true;
    setFooterStatus('loading');
    setOffset(offsetToLoad);
  }, [status]);

  // Repeats whichever request failed: the first page (full-screen error) or the
  // page at the end of the list. The offset is unchanged, so bumping `attempt`
  // is what makes the effect run again for the same page.
  const retry = useCallback(() => {
    if (isFetchingRef.current) return;
    if (status === 'error') {
      isFetchingRef.current = true;
      setStatus('loading');
      setAttempt((count) => count + 1);
    } else if (footerStatus === 'error') {
      isFetchingRef.current = true;
      setFooterStatus('loading');
      setAttempt((count) => count + 1);
    }
  }, [status, footerStatus]);

  return { status, retry, items, total, footerStatus, hasMore, loadMore };
}

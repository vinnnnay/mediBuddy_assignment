# MediSearch

A medicine search app built on the openFDA Drug Label API. Search by brand name, scan the
results, and open any product to read its label. Enter runs the search immediately instead of
waiting for the debounce, Escape clears it.

Live: _add your Vercel URL here_

## Running it

```bash
npm install
npm run dev
```

Opens on http://localhost:5173. No API key or environment variables are needed, openFDA is
public.

```bash
npm run build      # typecheck, then production build
npm run preview    # serve the production build locally
npm run typecheck  # types only
```

## Stack

React 19, TypeScript, Vite, React Router and Mantine.

Mantine because it gives you accessible inputs, cards, skeletons and an accordion out of the
box with no configuration step, which matters when the time budget is a few hours. Vite
because the app is a pure client side SPA and does not need a server framework. The one thing
a SPA does need on Vercel is `vercel.json`, which rewrites every path to `index.html` so
`/medicine/:id` resolves on a direct load instead of 404ing.

## How it works

```
SearchPage
  term (state, changes on every keystroke)
    -> useDebouncedValue, 400ms
      -> useMedicineSearch -> cache hit? -> render
                           -> else fetch with AbortSignal -> normalise -> cache -> render
    -> mirrored into ?q= so the search is shareable

MedicineCard -> /medicine/:id?q=<term>

MedicineDetailPage
  id from the URL -> useMedicineDetail -> search=id:"..." -> normalise -> render
```

Everything that talks to the API lives in `src/api`. `client.ts` owns the requests and the
error taxonomy, `medicine.ts` maps a raw label onto a flat `Medicine` type. Components never
see the raw response shape.

## The openFDA response

Two things about this API shaped most of the code.

**Fields under `openfda` are arrays, and plenty of them are missing.** `brand_name` can hold
two names, `route` can be absent entirely, and some labels have no `openfda` object at all.
Every field is read through one helper that trims, drops blanks and de-duplicates, so the
components receive `string[]` or `null` and never have to think about it. Cards render only
the fields that actually came back, so a sparse label produces a shorter card rather than a
row of dashes.

**A 404 does not mean failure.** Searching for a brand with no labels returns HTTP 404 with
`{"error":{"code":"NOT_FOUND"}}`. Treating that as an error would show "something went wrong"
for a perfectly ordinary empty search, so the client checks the code and resolves to an empty
list. A 404 without that code still throws. Real failures become an `ApiError` tagged
`network`, `rate-limited` or `server`, which is what lets the UI say something specific
instead of one generic message.

## Performance

The brief asks for debouncing, memoisation, caching, request cancellation and efficient
rendering. Each one is here for a reason I can point at.

**Debounce, 400ms.** Without it, "tylenol" is seven requests. With it, one. Measured in a
headless browser: seven keystrokes, one network call.

**Request cancellation.** The first version used a boolean flag in the effect cleanup to
ignore stale responses. That is enough to prevent a slow older response overwriting a newer
one, but the request still runs to completion, and openFDA rate limits by IP, so a response
nobody wants still costs a slot. An `AbortController` kills it at the network layer. Verified
against a deliberately slow response: the superseded request reports `net::ERR_ABORTED` and
the newer results render.

**Caching.** A small LRU in front of both hooks, 30 searches and 20 labels. It lives at module
level rather than in component state, which is the entire point, because it has to survive
navigating to a detail page and back. Retyping a query costs zero requests, and returning from
a detail page restores the results with no refetch.

**Memoisation, one boundary.** `term` is state that changes on every keystroke, so the search
page re-renders on every key while the debounced query has not changed. That was re-rendering
all 20 result cards for nothing. Instrumented with render counters, typing 14 characters over
a page of 20 results:

| | results renders | card renders |
| --- | --- | --- |
| before | 14 | 280 |
| after `memo(SearchResults)` | 0 | 0 |

It works because the props were already stable: `state` comes from `useState`, `onRetry` is a
`useCallback`, and `query` is a string compared by value.

`MedicineCard` is deliberately **not** memoised. It only re-renders when the results actually
change, and at that point the data is genuinely new, so per-card comparisons would cost more
than they save. There is no `useMemo` anywhere either. Normalisation runs once per fetch
inside the promise, not during render, so memoising it would be noise.

## Detail page, refresh and direct links

The detail page never reads from search state. It takes the id out of the URL and refetches
with `search=id:"..."`, so clicking a card, refreshing, and pasting the link into a new tab
all behave identically.

The back link needs to know which results to return to, and `location.state` would be gone
after a refresh, so cards pass the query in the URL instead: `/medicine/:id?q=tylenol`. After
a reload the link still reads "Back to results for tylenol". Opened cold with no `q`, it reads
"Back to search" and goes to the home page. An id that no longer resolves gets a "not found"
state with a way back, not an error.

## Trade-offs

**Search is brand name first.** That is what the brief specified. If the brand search comes
back empty the app retries against `openfda.generic_name` and says so above the results, which
costs one extra request only on the path that would otherwise be a dead end. It fires less
often than you would expect: most generic names are also registered brand names, so
`brand_name:"ibuprofen"` already returns over a thousand labels on its own.

**Only the first 20 results.** The app now says "Showing 20 of 111" using `meta.results.total`,
but there is no way to see the rest. Pagination via `&skip=` is straightforward, except that
the cache key has to include the offset and the offset has to reset on every query change, and
getting that subtly wrong is worse than not having it.

**No tests.** With more time the two worth writing are that a slow response never overwrites a
newer one, and that a 404 renders empty rather than error. Both are logic a reader currently
has to take on trust.

**Mantine ships more CSS than this app uses.** The global stylesheet is around 200KB
uncompressed, 29KB gzipped. Importing per-component styles would trim it, but it was not worth
the time here.

**Search terms sit in the URL.** `?q=` makes searches shareable and makes the back button
behave, which is why it is there. It also puts a health-adjacent term in browser history. For
a real product that is a decision worth making deliberately rather than by default.

## Scroll position

Navigating forward scrolls to the top. Going back restores where you were, which matters here
because the cache brings the results back instantly and it would be odd to land at the top of
a list you had scrolled halfway down.

The awkward part is that on back, the results render from a `useEffect`, so at the moment the
restore runs the page is still short and `scrollTo` clamps. The restore retries on animation
frames until the page is tall enough or it gives up. Scroll positions are also recorded with a
guard that ignores events fired while the document is shrinking, because tearing down the
results grid makes the browser clamp the scroll position and report it as a scroll.

## Next

Pagination, filters on route and product type, and a brand name typeahead built on openFDA's
`count=openfda.brand_name.exact`, which returns ranked distinct brand names.

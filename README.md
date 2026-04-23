# Gastronaut

One input. One restaurant. One tap.

A mobile-first web app that picks a random restaurant with verified availability near you and sends you straight to OpenTable to book it. The value is intentional serendipity — no browsing, no comparing.

## Stack

- Next.js 14 (App Router) + React 18
- Tailwind CSS
- Single API route (`/api/restaurants`) — no DB, no auth
- Restaurant data + booking deep links: OpenTable (undocumented public GQL endpoint)

## Run it

```bash
npm install
npm run dev
# http://localhost:3000
```

Type check:

```bash
npm run typecheck
```

## OpenTable integration

V1 ships with a **mock** implementation (12 NYC fixtures, deterministic slot availability) so the full UX runs end-to-end without hitting OpenTable.

To swap in the real OpenTable GQL:

1. Open <https://www.opentable.com> in a browser and perform a search (location, date, time, party size).
2. In DevTools → Network, find the POST to `https://www.opentable.com/dapi/fe/gql`.
3. Copy the `query` string and `variables` shape.
4. Open `lib/opentable.query.ts` and:
   - Paste the query into `OPENTABLE_QUERY`.
   - Implement `buildVariables(params)` to return the expected variables object.
   - Implement `parseResponse(raw, params)` to map OpenTable's response into our `Restaurant` type.
5. Set `OPENTABLE_MODE=live` in `.env.local` and restart the dev server.

If the GQL response shape ever drifts, `parseResponse` should throw with a snippet of the raw payload so debugging is straightforward.

## Booking URL format

```
https://www.opentable.com/restref/client/?restref={opentableId}&partysize={n}&datetime={YYYY-MM-DDTHH:mm}
```

Built by `lib/bookingUrl.ts`. Lands the user on the restaurant's OpenTable booking page with date/time/party pre-filled; they just confirm (or log in and confirm).

## Project layout

```
app/
  layout.tsx                 # html shell, viewport, theme
  page.tsx                   # state machine: input → loading → result / empty
  api/restaurants/route.ts   # GET handler; validates + calls searchRestaurants
components/
  InputScreen.tsx
  LoadingScreen.tsx
  RestaurantCard.tsx
  NoResults.tsx
lib/
  opentable.ts               # searchRestaurants() — mock | live
  opentable.mock.ts          # 12 NYC fixtures
  opentable.query.ts         # TODO: paste captured GQL here
  bookingUrl.ts              # deep link builder
  geo.ts                     # haversine, NYC fallback coords, distance format
  types.ts
```

## Known limitations (V1)

- **OpenTable-only** coverage. No Resy / Tock / independent booking systems.
- **No geocoding.** If the user types a neighborhood instead of allowing geolocation, the app falls back to NYC coords (40.758, -73.9855). Adding a real geocoder (Mapbox or Google) requires an API key.
- **Mock mode ships first.** Real restaurant data requires completing the OpenTable GQL swap described above.
- **Unofficial API fragility.** When OpenTable changes their GQL shape, `lib/opentable.query.ts` will need a re-capture.

## Deploy

Designed for Vercel. No environment variables required for mock mode. Push to a branch, connect to Vercel, done.

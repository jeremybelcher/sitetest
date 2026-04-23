// ============================================================================
// OpenTable GQL — persisted query constants
// ============================================================================
//
// OpenTable's web client uses Apollo Persisted Queries: the request sends only
// the operation name + sha256 hash + variables. The full GraphQL query text
// lives on OpenTable's server, keyed by hash.
//
// These hashes were captured from opentable.com on 2026-04-23. If OpenTable
// rolls a new client build the hashes may change — open DevTools, watch the
// requests to /dapi/fe/gql, and update the constants below.
// ============================================================================

export const OPENTABLE_GQL_ENDPOINT = "https://www.opentable.com/dapi/fe/gql";

// Discovery: lat/lng/date/time/partySize/prices -> list of restaurants
export const MULTI_SEARCH_RESULTS_FACETS_HASH =
  "620f71cb9b8ad0e70fe7f01e08440806ceaa7793735e368024c3eae65cc004f7";

// Availability: restaurantIds[] -> time slots for each
export const RESTAURANTS_AVAILABILITY_HASH =
  "cbcf4838a9b399f742e3741785df64560a826d8d3cc2828aa01ab09a8455e29e";

// Decoded: {"v":2,"m":1,"p":0,"s":0,"n":0} — same token for every restaurant
// in captured traffic. Treat as an opaque constant.
export const AVAILABILITY_TOKEN = "eyJ2IjoyLCJtIjoxLCJwIjowLCJzIjowLCJuIjowfQ";

export const OPENTABLE_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36";

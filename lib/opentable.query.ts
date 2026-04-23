// ============================================================================
// OpenTable GQL query placeholder
// ============================================================================
//
// TODO: paste captured GQL
//
// To wire this up:
//   1. Open https://www.opentable.com in a browser, perform a restaurant +
//      availability search with a date, time, party size, and location.
//   2. In DevTools, Network tab, find the request to
//      https://www.opentable.com/dapi/fe/gql
//   3. Copy the `query` string (the operation) and the `variables` shape.
//   4. Replace the placeholder below with the captured query string and
//      update buildVariables() to return the variables object in the shape
//      OpenTable expects.
//   5. Update parseResponse() to extract restaurants + slots from the exact
//      response shape you see. Throw with a descriptive message if shape
//      doesn't match, so failures are loud not silent.
//   6. Set OPENTABLE_MODE=live in .env.local.
// ============================================================================

import type { Restaurant, SearchParams } from "./types";

export const OPENTABLE_GQL_ENDPOINT = "https://www.opentable.com/dapi/fe/gql";

export const OPENTABLE_QUERY = `
  # TODO: paste captured OpenTable GQL query here.
  # See comment block at top of this file for instructions.
`;

export function buildVariables(_params: SearchParams): Record<string, unknown> {
  throw new Error(
    "OpenTable live mode is not configured. Paste the captured GQL query into lib/opentable.query.ts and implement buildVariables() + parseResponse(). See file header for instructions.",
  );
}

export function parseResponse(
  _raw: unknown,
  _params: SearchParams,
): Restaurant[] {
  throw new Error(
    "OpenTable live mode is not configured. Paste the captured GQL query into lib/opentable.query.ts and implement buildVariables() + parseResponse(). See file header for instructions.",
  );
}

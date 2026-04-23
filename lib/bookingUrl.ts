export function buildBookingUrl(args: {
  opentableId: string;
  partySize: number;
  datetime: string;
}): string {
  const dt = normalizeDatetime(args.datetime);
  const params = new URLSearchParams({
    restref: args.opentableId,
    partysize: String(args.partySize),
    datetime: dt,
  });
  return `https://www.opentable.com/restref/client/?${params.toString()}`;
}

function normalizeDatetime(input: string): string {
  const m = input.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (m) return `${m[1]}T${m[2]}`;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

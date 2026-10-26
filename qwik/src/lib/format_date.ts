import { DateTime } from "luxon";

/** Formats an ISO timestamp from the database as `Oct 19 2026`. */
export function format_date(iso: string) {
    return DateTime.fromISO(iso).toFormat("LLL dd yyyy");
}

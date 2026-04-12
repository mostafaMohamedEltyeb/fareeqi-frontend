/**
 * Centralised date formatting — always uses the Gregorian calendar with
 * English month names (en-GB) regardless of the app's language setting.
 *
 * 'ar-SA' renders dates in the Hijri calendar (e.g. "١٤٤٥/٩/١٢").
 * These helpers always produce Gregorian output (e.g. "12 May 2024, 10:30").
 */

/** "12 May 2024, 10:30" */
export const fmtDateTime = (dt: string): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(dt));
  } catch {
    return dt;
  }
};

/** "12 May 2024" */
export const fmtDate = (dt: string): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(dt));
  } catch {
    return dt;
  }
};

/** "10:30" */
export const fmtTime = (dt: string): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(dt));
  } catch {
    return dt;
  }
};

/** "Mon, 12 May" — used for slot day headers */
export const fmtDayLabel = (dt: string): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    }).format(new Date(dt));
  } catch {
    return dt;
  }
};

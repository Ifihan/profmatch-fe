/**
 * Holds form data (including File objects) between the home page
 * and the processing page within the same browser session.
 * We can't serialize File objects into sessionStorage, so we
 * keep them in a module-level variable that survives client-side
 * navigation in Next.js.
 */

export interface PendingSearch {
  university: string;
  researchInterests: string[];
  files: File[];
  token?: string;
}

let pending: PendingSearch | null = null;

export function setPendingSearch(data: PendingSearch) {
  pending = data;
}

export function consumePendingSearch(): PendingSearch | null {
  const data = pending;
  pending = null;
  return data;
}

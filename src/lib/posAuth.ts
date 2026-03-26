const SESSION_KEY = 'scstix_pos_authenticated';

/** Hardcoded terminal login (client-side demo only). */
export const HARDCODED_POS_USERNAME = 'cashier@scstix.com';
export const HARDCODED_POS_PASSWORD = 'cashier@123';

export function isPosAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPosAuthenticated(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Validates against the hardcoded username/password above. */
export function tryPosLogin(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === HARDCODED_POS_USERNAME.toLowerCase() &&
    password === HARDCODED_POS_PASSWORD;
  if (ok) setPosAuthenticated(true);
  return ok;
}

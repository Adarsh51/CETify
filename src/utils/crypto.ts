import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hashes a password with a random salt using scrypt.
 * Format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  
  try {
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch (e) {
    return false; // Timing safe equal throws if lengths don't match
  }
}

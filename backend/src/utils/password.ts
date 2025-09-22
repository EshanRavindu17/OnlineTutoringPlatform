// Using bcrypt for password hashing - more secure than MD5 or SHA
// bcrypt is good because it's slow and includes salt automatically
import bcrypt from 'bcrypt';

// Number of rounds for bcrypt
// Higher = more secure but slower
// 12 is a good balance between security and performance
// Don't change this after deployment or existing passwords will break!
const ROUNDS = 12;

// Takes a plain password and returns a hashed version
// Always returns a different hash even for the same password (because of salt)
// Example: 'password123' -> '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K'
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

// Checks if a plain password matches a hashed one
// Returns true if match, false if not
// Use this for login verification
// Example: verifyPassword('password123', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K')
export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

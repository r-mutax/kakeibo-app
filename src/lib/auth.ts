import { createHash } from 'crypto'

export function hashPasscode(passcode: string): string {
  return createHash('sha256').update(passcode).digest('hex')
}

export function verifyPasscode(passcode: string, hashedPasscode: string): boolean {
  return hashPasscode(passcode) === hashedPasscode
}
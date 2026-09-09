/** Longest password the backend accepts: bcrypt only reads the first 72 bytes. */
export const PASSWORD_MAX_BYTES = 72
export const PASSWORD_MIN_LENGTH = 8

/** Mirrors the backend's checkPasswordStrength so we can fail before the round-trip. */
export function passwordProblems(password: string): string[] {
  const problems: string[] = []

  if (password.length < PASSWORD_MIN_LENGTH) {
    problems.push(`дор хаяж ${PASSWORD_MIN_LENGTH} тэмдэгт`)
  }
  if (!/[a-z]/.test(password)) problems.push('жижиг үсэг')
  if (!/[A-Z]/.test(password)) problems.push('том үсэг')
  if (!/[^A-Za-z0-9]/.test(password)) problems.push('тусгай тэмдэгт')

  return problems
}

export function isPasswordTooLong(password: string): boolean {
  return new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES
}

/** Deliberately loose, matching the backend's EMAIL_RE. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

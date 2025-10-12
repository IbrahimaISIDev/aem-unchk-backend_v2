export type PasswordStrength = {
  score: number;
  length: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  containsCommon: boolean;
};

const COMMON_PATTERNS = [
  'password', '1234', '12345', '123456', 'azerty', 'qwerty', 'admin', 'welcome', 'letmein', 'monkey', 'dragon', 'iloveyou'
];

export function computePasswordStrength(pwd: string): PasswordStrength {
  const length = pwd?.length || 0;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const lowerPwd = (pwd || '').toLowerCase();
  const containsCommon = COMMON_PATTERNS.some(p => lowerPwd.includes(p));

  let score = 0;
  if (length >= 8) score += 30;
  if (length >= 12) score += 10;
  if (hasLower) score += 10;
  if (hasUpper) score += 15;
  if (hasDigit) score += 15;
  if (hasSymbol) score += 20;
  if (containsCommon) score -= 20;
  if (length >= 16) score += 10;
  score = Math.max(0, Math.min(100, score));

  return { score, length, hasLower, hasUpper, hasDigit, hasSymbol, containsCommon };
}

export function isStrongPassword(pwd: string, minScore = 70): boolean {
  const s = computePasswordStrength(pwd);
  return s.score >= minScore && s.length >= 8 && s.hasLower && s.hasUpper && s.hasDigit;
}

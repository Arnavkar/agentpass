import base32Encode from 'base32-encode';

export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20); // Standard length for TOTP secret
  crypto.getRandomValues(bytes);
  // Convert to Base32 for TOTP
  return base32Encode(bytes, 'RFC4648', { padding: false });
}
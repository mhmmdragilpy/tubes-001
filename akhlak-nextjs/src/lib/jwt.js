import { SignJWT, jwtVerify } from 'jose';

// In production, this should be in .env
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rahasia-negara-akhlak-360-super-secure-key-2026'
);

export async function signToken(payload) {
  const alg = 'HS256';
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.APP_PIN || 'default-secret-key';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // La sesión dura 1 día
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession() {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 día
  const session = await encrypt({ user: 'admin', expires });

  cookies().set('session', session, { expires, httpOnly: true });
}

export async function verifySession(session: string | undefined) {
    if (!session) return false;
    const decrypted = await decrypt(session);
    return !!decrypted;
}

export async function deleteSession() {
  cookies().set('session', '', { expires: new Date(0) });
}

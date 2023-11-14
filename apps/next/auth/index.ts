import { envServer } from '@/env/server.mjs';

import jwt from 'jsonwebtoken';

export function checkAdmin(req: Request) {
  const token = getToken(req);
  if (!token) {
    return false;
  }
  try {
    const payload = jwt.verify(token, envServer.JWT_SECRET) as jwt.JwtPayload;
    return payload.admin === true;
  } catch {
    return false;
  }
}

export function checkUser(req: Request) {
  const token = getToken(req);
  if (!token) {
    return false;
  }
  try {
    const payload = jwt.verify(token, envServer.JWT_SECRET) as jwt.JwtPayload;
    return !!payload.code;
  } catch {
    return false;
  }
}

export function getToken(req: Request) {
  return req.headers.get('Authorization');
}

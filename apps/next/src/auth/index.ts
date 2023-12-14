import * as jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

import { envServer } from '@/env/server.mjs';

export function checkAdmin(req: NextApiRequest) {
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

export function checkUser(req: NextApiRequest) {
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

function getToken(req: NextApiRequest) {
  return req.headers.authorization;
}

import { checkAdmin, checkUser } from '@/auth';
import { UserRole } from '@/helpers/UserRole';
import { emptyHandler } from '@/helpers/emptyHandler';

type POSTOutput = { role?: UserRole };
export function POST(req: Request) {
  let resp: POSTOutput;
  switch (true) {
    case checkAdmin(req):
      resp = { role: 'admin' };
      break;

    case checkUser(req):
      resp = { role: 'user' };
      break;

    default:
      resp = { role: undefined };
      break;
  }
  return Response.json(resp);
}

export const OPTIONS = emptyHandler;

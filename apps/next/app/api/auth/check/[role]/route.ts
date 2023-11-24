import { checkAdmin, checkUser } from '@/auth';
import { UserRole } from '@/helpers/UserRole';
import { emptyHandler } from '@/helpers/emptyHandler';

type POSTParams = { params: { role?: UserRole } };
export function POST(req: Request, { params }: POSTParams) {
  const isAllowed = (() => {
    switch (params.role) {
      case 'admin': {
        return checkAdmin(req);
      }
      case 'user': {
        return checkUser(req);
      }
      default: {
        return false;
      }
    }
  })();

  if (isAllowed) {
    return new Response();
  }
  return new Response('Forbidden', { status: 403 });
}

export const OPTIONS = emptyHandler;

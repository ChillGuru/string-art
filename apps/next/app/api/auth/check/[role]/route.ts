import { checkAdmin, checkUser } from '@/auth';

type POSTParams = { params: { role?: 'user' | 'admin' } };
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

import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Redirect } from 'react-router';

import { env } from '@/env';
import { UserRole } from '@/modules/Auth/models';
import { Token } from '@/modules/Auth/service';

export function Protected({
  userRole,
  children,
}: {
  userRole: UserRole;
  children: ReactNode;
}) {
  const authCheck = useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      const res = await fetch(`${env.VITE_API_URL}/auth/check/${userRole}`, {
        method: 'POST',
        headers: Token.value
          ? {
              Authorization: Token.value,
            }
          : undefined,
      });
      return res.ok;
    },
  });

  if (authCheck.data === undefined) {
    return 'Loading...'; // TODO put smth better here
  }

  if (!authCheck.data) {
    return <Redirect to='/' />;
  }

  return children;
}

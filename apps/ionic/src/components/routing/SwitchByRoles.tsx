import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Redirect } from 'react-router';

import { env } from '@/env';
import { jsonContentHeader } from '@/helpers/jsonContentHeader';
import { UserRole } from '@/modules/Auth/models';
import { AuthService } from '@/modules/Auth/service';

type Props = {
  onRoles: Record<UserRole, () => ReactNode>;
};

export function SwitchByRoles({
  children,
  onRoles,
}: React.PropsWithChildren<Props>) {
  const authCheck = useQuery({
    queryKey: ['auth-check', 'redirect'],
    async queryFn() {
      const resp: { role?: UserRole } = await fetch(
        `${env.VITE_API_URL}/auth/check`,
        {
          method: 'POST',
          headers: { ...AuthService.authHeader, ...jsonContentHeader },
        }
      ).then((res) => res.json());
      return resp;
    },
  });

  if (authCheck.data === undefined) {
    return 'Loading...';
  }

  if (authCheck.data.role === undefined) {
    return children;
  }

  // const Comp = onRoles[authCheck.data.role];
  if (authCheck.data.role === 'admin') {
    return <Redirect to='/admin' />;
  }

  return <Redirect to='/app' />;
}

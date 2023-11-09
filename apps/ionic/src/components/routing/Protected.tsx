import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'react-router';

import { env } from '@/env';

export function Protected({ children }: React.PropsWithChildren) {
  const authCheck = useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      const res = await fetch(`${env.VITE_API_URL}/auth/check/admin`, {
        method: 'POST',
        headers: {},
      });
      return res.ok;
    },
  });

  if (authCheck.data === undefined) {
    return 'Loading...';
  }

  if (!authCheck.data) {
    return <Redirect to='/' />;
  }

  return children;
}

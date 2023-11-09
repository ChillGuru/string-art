import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'react-router';

import { env } from '@/env';
import { Token } from '@/services/Token';

export function Protected({ children }: React.PropsWithChildren) {
  const authCheck = useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      const res = await fetch(`${env.VITE_API_URL}/auth/check/admin`, {
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
    return 'Loading...';
  }

  if (!authCheck.data) {
    return <Redirect to='/' />;
  }

  return children;
}

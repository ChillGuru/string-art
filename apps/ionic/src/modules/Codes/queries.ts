import { UseQueryOptions } from '@tanstack/react-query';
import { Code } from 'ui';

import { env } from '@/env';

import { AuthService } from '../Auth/service';

export const getAllCodesQuery = {
  queryKey: ['get', 'codes'],
  async queryFn() {
    const resp = await fetch(`${env.VITE_API_URL}/codes`, {
      headers: { Authorization: AuthService.token ?? '' },
    });
    const data = await resp.json();
    return data as Code[];
  },
  staleTime: 60 * 60 * 1000,
} satisfies UseQueryOptions;

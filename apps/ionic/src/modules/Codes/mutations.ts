import { UseMutationOptions } from '@tanstack/react-query';
import { Code, CodeInput } from 'ui';

import { env } from '@/env';
import { jsonContentHeader } from '@/helpers/jsonContentHeader';

import { AuthService } from '../Auth/service';

export const addCodeMutation = {
  async mutationFn(input) {
    const resp = await fetch(`${env.VITE_API_URL}/codes`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        ...AuthService.authHeader,
        ...jsonContentHeader,
      },
    });
    const respData: Code = await resp.json();
    return respData;
  },
} satisfies UseMutationOptions<Code, Error, CodeInput>;

export const deleteCodeMutation = {
  async mutationFn(input) {
    const resp = await fetch(`${env.VITE_API_URL}/codes`, {
      method: 'DELETE',
      body: JSON.stringify(input),
      headers: {
        ...AuthService.authHeader,
        ...jsonContentHeader,
      },
    });
    const respData: Code = await resp.json();
    return respData;
  },
} satisfies UseMutationOptions<Code, Error, CodeInput>;

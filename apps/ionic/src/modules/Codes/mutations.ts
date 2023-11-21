import { UseMutationOptions } from '@tanstack/react-query';

import { env } from '@/env';

import { AuthService, Token } from '../Auth/service';

import { Code, CodeForm } from './models';

export const addCodeMutation = {
  async mutationFn(input) {
    const resp = await fetch(`${env.VITE_API_URL}/codes`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        Authorization: Token.value ?? '',
      },
    });
    const respData: Code = await resp.json();
    return respData;
  },
} satisfies UseMutationOptions<Code, Error, CodeForm>;

export const deleteCodeMutation = {
  async mutationFn(input) {
    const resp = await fetch(`${env.VITE_API_URL}/codes`, {
      method: 'DELETE',
      body: JSON.stringify(input),
      headers: {
        ...AuthService.authHeader,
      },
    });
    const respData: Code = await resp.json();
    return respData;
  },
} satisfies UseMutationOptions<Code, Error, CodeForm>;

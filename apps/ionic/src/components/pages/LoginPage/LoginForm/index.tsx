import { zodResolver } from '@hookform/resolvers/zod';
import { useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { env } from '@/env';
import { jsonContentHeader } from '@/helpers/jsonContentHeader';
import { TLoginForm, UserRole, loginFormSchema } from '@/modules/Auth/models';
import { AuthService } from '@/modules/Auth/service';
import { useHookFormMask } from 'use-mask-input';

import styles from './styles.module.scss';

export function LoginForm() {
  const router = useIonRouter();

  const loginForm = useForm<TLoginForm>({
    resolver: zodResolver(loginFormSchema),
  });

  const registerWithMask = useHookFormMask(loginForm.register);

  const onSubmit = loginForm.handleSubmit(async (data) => {
    data.code = data.code.replace('-', '');

    const resp: { token: string; role: UserRole } = await fetch(
      `${env.VITE_API_URL}/auth/login`,
      {
        method: 'POST',
        headers: { ...jsonContentHeader },
        body: JSON.stringify({ code: data.code }),
      }
    ).then((res) => res.json());

    AuthService.token = resp.token;
    if (resp.role === 'admin') {
      return router.push('/admin', 'forward', 'replace');
    }
    if (resp.role === 'user') {
      return router.push('/app', 'forward', 'replace');
    }
  });

  const errorMsg = loginForm.formState.errors.code?.message;

  return (
    <div className={styles.loginForm}>
      <span className={styles.formHeader}>Введите код с коробки</span>
      <form onSubmit={onSubmit}>
        <div className={styles.formInner}>
          <input
            type='text'
            placeholder='XXXX-XXXX'
            {...registerWithMask('code', ['9999-9999'])}
            className={errorMsg ? styles.formInputError : styles.formInput}
          />
          <button
            type='submit'
            className={
              loginForm.formState.isValid
                ? styles.activeSubmitButton
                : styles.submitButton
            }
          >
            &gt;
          </button>
        </div>
      </form>
      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
    </div>
  );
}

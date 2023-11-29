import { zodResolver } from '@hookform/resolvers/zod';
import { useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { env } from '@/env';
import { jsonContentHeader } from '@/helpers/jsonContentHeader';
import { TLoginForm, UserRole, loginFormSchema } from '@/modules/Auth/models';
import { AuthService } from '@/modules/Auth/service';

import styles from './styles.module.scss';

export function LoginForm() {
  const loginForm = useForm<TLoginForm>({
    resolver: zodResolver(loginFormSchema),
  });
  const router = useIonRouter();

  const onSubmit = loginForm.handleSubmit(async (data) => {
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
            placeholder='XXXXXXXX'
            {...loginForm.register('code')}
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

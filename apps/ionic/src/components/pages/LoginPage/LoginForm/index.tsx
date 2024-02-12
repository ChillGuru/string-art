import { zodResolver } from '@hookform/resolvers/zod';
import { IonButton, IonIcon, useIonRouter } from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import { useForm } from 'react-hook-form';
import { useHookFormMask } from 'use-mask-input';

import { env } from '@/env';
import { jsonContentHeader } from '@/helpers/jsonContentHeader';
import { TLoginForm, UserRole, loginFormSchema } from '@/modules/Auth/models';
import { AuthService } from '@/modules/Auth/service';

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
            {...registerWithMask('code', ['****-****'])}
            className={errorMsg ? styles.formInputError : styles.formInput}
          />
          <IonButton
            type='submit'
            shape='round'
            disabled={!loginForm.formState.isValid}
          >
            <IonIcon slot='icon-only' icon={chevronForward} />
          </IonButton>
        </div>
      </form>
      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
    </div>
  );
}

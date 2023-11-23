import { useState } from 'react';

import styles from './styles.module.scss';

export function LoginForm() {
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const requiredCodeLength = 8;

  return (
    <div className={styles.loginForm}>
      <span className={styles.formHeader}>Введите код с коробки</span>
      <div className={styles.formInner}>
        <input
          type='text'
          placeholder='XXXXXXXX'
          value={code}
          maxLength={requiredCodeLength}
          className={error ? styles.formInputError : styles.formInput}
        />
        <button
          type='submit'
          className={
            code.length === requiredCodeLength
              ? styles.activeSubmitButton
              : styles.submitButton
          }
        >
          &gt;
        </button>
      </div>

      {token && <div>Авторизация прошла успешно!</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}

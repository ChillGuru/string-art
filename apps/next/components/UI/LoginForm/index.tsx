'use client';

import axios from 'axios';
import { useState } from 'react';

import styles from './styles.module.scss';

import { getToken } from '@/app/api/auth';

const LoginForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const requiredCodeLength = 8;

  async function getToken(code: string): Promise<string> {
    const response = await axios.post(
      'https://kaleidoscope-backend.onrender.com/login',
      {
        code,
      }
    );

    return response.data.token;
  }
  const inputReset = (value: string) => {
    setCode(value);
    setError('');
  };

  const handleLogin = async () => {
    if (code.length == requiredCodeLength) {
      try {
        const newToken = await getToken(code);
        setToken(newToken);
      } catch (error) {
        setError('Неверный код');
      }
    } else setError('Код должен состоять из 8 символов');
  };

  return (
    <div className={styles.loginForm}>
      <span className={styles.formHeader}>Введите код с коробки</span>
      <div className={styles.formInner}>
        <input
          type='text'
          placeholder='XXXXXXXX'
          value={code}
          maxLength={requiredCodeLength}
          onChange={(e) => inputReset(e.target.value)}
          className={error ? styles.formInputError : styles.formInput}
        />
        <button
          onClick={handleLogin}
          className={
            code.length == requiredCodeLength
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
};

export default LoginForm;

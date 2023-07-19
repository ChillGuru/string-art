'use client'
import { getToken } from '@/app/api/auth';
import { useState } from 'react';
import axios from 'axios';

const Test: React.FC = () => {
    const [code, setCode] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    

  async function getToken(code: string): Promise<string> {
    const response = await axios.post('https://kaleidoscope-backend.onrender.com/login', {
      code
    });

  return response.data.token;
}
  
    const handleLogin = async () => {
    try {
      const newToken = await getToken(code);
      setToken(newToken);
      setError('');
    } catch (error) {
      setError('Ошибка авторизации');
    }
  };
  
    return (
        <>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
            <button onClick={handleLogin}>Войти</button>
            {token && <div>Токен: {token}</div>}
            {error && <div>{error}</div>}
        </>
)}

export default Test;
import axios from 'axios';

export async function getToken(code: string): Promise<string> {
  const response = await axios.post('https://kaleidoscope-backend.onrender.com/login', {
    code
  });

  return response.data.token;
}

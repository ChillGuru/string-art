export const Token = {
  get value(): string | undefined {
    return localStorage.getItem('token') ?? undefined;
  },
  set value(newValue: string | undefined) {
    if (newValue) {
      localStorage.setItem('token', newValue);
    } else {
      localStorage.removeItem('token');
    }
  },
};

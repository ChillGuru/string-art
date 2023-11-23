export const AuthService = {
  get token(): string | undefined {
    return localStorage.getItem('token') ?? undefined;
  },
  set token(newValue: string | undefined) {
    if (newValue) {
      localStorage.setItem('token', newValue);
    } else {
      localStorage.removeItem('token');
    }
  },
  get authHeader() {
    return { Authorization: this.token ?? '' };
  },
  logOut(callback: () => void) {
    this.token = undefined;
    callback();
  },
};

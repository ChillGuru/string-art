import loginPageImg from '@/images/LoginPageImage.png';

import { LoginForm } from './LoginForm';
import styles from './styles.module.scss';

export function LoginPage() {
  return (
    <>
      <h3 className={styles.header}>
        Создай
        <br />
        свою картину нитями
        <br />
        из любой фотографии
      </h3>
      <img
        className={styles.img}
        src={loginPageImg}
        alt='String Art'
      />
      <LoginForm />
    </>
  );
}

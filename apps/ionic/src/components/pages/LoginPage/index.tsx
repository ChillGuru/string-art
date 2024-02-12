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
        src={
          'https://media.discordapp.net/attachments/440794085352275988/1199323392336207932/LoginPageImage.png'
        }
        alt='String Art'
      />
      <LoginForm />
    </>
  );
}

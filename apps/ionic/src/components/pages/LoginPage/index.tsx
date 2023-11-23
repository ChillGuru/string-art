import { LoginForm } from './LoginForm';
import styles from './styles.module.scss';

// import Image from 'next/image';

export function LoginPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.header}>
        СОЗДАЙ
        <br />
        СВОЮ КАРТИНУ НИТЯМИ
        <br />
        ИЗ ЛЮБОЙ ФОТОГРАФИИ
      </h1>
      {/* <Image src={LoginImage} alt='String Art' className={styles.img} /> */}
      <LoginForm />
    </main>
  );
}

import LoginForm from '../../components/LoginForm';
import LoginImage from '../../../public/string-art-circle.svg';
import styles from './styles.module.scss';

// import Image from 'next/image';

const LoginPage: React.FC = () => {
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

export default LoginPage;
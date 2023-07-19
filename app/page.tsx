import Image from 'next/image'
import styles from '/styles/login.module.scss'
import LoginImage from '../public/string-art-circle.svg';
import LoginForm from '@/components/UI/LoginForm';

export default async function Home() {
  return (
    <main className={styles.main}>     
      <h1 className={styles.header}>
        СОЗДАЙ <br />СВОЮ КАРТИНУ НИТЯМИ <br />ИЗ ЛЮБОЙ ФОТОГРАФИИ
      </h1>
      <Image src={LoginImage} alt="String Art" className={styles.img}/>
      <LoginForm />
    </main>
  )
}

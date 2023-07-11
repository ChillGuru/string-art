import Image from 'next/image'
import styles from '/styles/page.module.scss'
import { GetServerSideProps } from 'next';

export default function Home() {
  return (
    <main className={styles.main}>
      Страница ввода кода
    </main>
  )
}

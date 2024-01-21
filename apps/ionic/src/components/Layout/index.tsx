import { animated, useSpring } from '@react-spring/web';

import '@/styles/globals.scss';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './styles.module.scss';

interface Props {
  children: React.ReactNode;
}

export function Layout(props: Props) {
  const { children } = props;
  const bodySpring = useSpring({ from: { opacity: 0 }, to: { opacity: 1 } });
  return (
    <div className='container'>
      <Header />
      <animated.main className={styles.main} style={{ ...bodySpring }}>
        {children}
      </animated.main>
      <Footer />
    </div>
  );
}

import { ReactNode } from 'react';

import styles from './styles.module.scss';

type Props = {
  children?: ReactNode;
};

export function Header({ children }: Props) {
  return (
    <header className={styles.container}>
      <span className={styles.title}>Момент</span>
      {children}
    </header>
  );
}

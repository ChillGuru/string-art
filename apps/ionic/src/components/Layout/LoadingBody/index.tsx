import { IonSpinner } from '@ionic/react';

import styles from './styles.module.scss';

export function LoadingBody() {
  return (
    <main className={styles.main}>
      <IonSpinner name='dots'></IonSpinner>
    </main>
  );
}

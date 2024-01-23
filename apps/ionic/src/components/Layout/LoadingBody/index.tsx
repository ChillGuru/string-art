import { IonSpinner } from '@ionic/react';

import styles from './styles.module.scss';

export function LoadingBody() {
  return <IonSpinner name='dots' className={styles.spinner}></IonSpinner>;
}

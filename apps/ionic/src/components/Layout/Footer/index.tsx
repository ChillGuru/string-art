import { IonIcon } from '@ionic/react';
import { logoVk } from 'ionicons/icons';

import logoWb from '@/components/Icons/svg/wildberries.svg';

import styles from './styles.module.scss';

export function Footer() {
  return (
    <footer className={styles.container}>
      <div className={styles.icons}>
        <a href='https://www.wildberries.ru'>
          <IonIcon src={logoWb} />
        </a>
        <a href='https://vk.com'>
          <IonIcon icon={logoVk} />
        </a>
      </div>
      <span>moment@art.ru</span>
    </footer>
  );
}

import { IonButton } from '@ionic/react';
import { Code } from 'ui';

import { XIcon } from '@/components/Icons';

import styles from './styles.module.scss';

type Props = {
  code: Code;
  handleDelete: () => void;
};

export function CodeListItem({ code, handleDelete }: Props) {
  return (
    <li className={styles.container}>
      <span>Код: {code.value}</span>
      <span>Использований: {code.timesUsed}</span>
      <IonButton
        type='button'
        onClick={handleDelete}
        size='small'
        shape='round'
        color='danger'
      >
        <XIcon />
      </IonButton>
    </li>
  );
}

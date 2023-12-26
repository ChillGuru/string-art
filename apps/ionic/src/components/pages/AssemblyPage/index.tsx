import { IonButton, IonIcon } from '@ionic/react';
import { pause, play, playBack, playForward } from 'ionicons/icons';
import { useState } from 'react';
import { Redirect } from 'react-router';

import { Header } from '@/components/Layout/Header';
import { stepBack, stepForward } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

export function AssemblyPage() {
  const steps = useAppSelector((s: RootState) => s.generator.steps);
  const curStep = useAppSelector((s: RootState) => s.generator.currentStep);

  const dispatch = useAppDispatch();

  const [playing, setPlaying] = useState(false);

  if (steps.length === 0) {
    return <Redirect to='/app' />;
  }

  return (
    <div className='container'>
      <Header>Шаг</Header>
      <main className={styles.main}>
        <ol className={styles.list}>
          {new Array(5)
            .fill(0)
            .map((_, idx) => idx - Math.floor(5 / 2))
            // .filter(
            //   (offset) =>
            //     curStep + offset >= 0 && curStep + offset < steps.length
            // )
            .map((offset) => (
              <li key={offset}>
                {offset === 0 && (
                  <div className={styles.currentStep}>
                    {steps[curStep + offset]}
                  </div>
                )}
                {offset !== 0 && (
                  <div className={styles.step}>{steps[curStep + offset]}</div>
                )}
              </li>
            ))}
        </ol>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerGroup}>
          {curStep + 1}/{steps.length}
        </div>
        <div className={styles.footerMainGroup}>
          <IonButton
            size='large'
            fill='clear'
            shape='round'
            color='dark'
            onClick={() => {
              dispatch(stepBack());
            }}
          >
            <IonIcon slot='icon-only' icon={playBack} />
          </IonButton>
          <IonButton
            size='large'
            fill='clear'
            shape='round'
            color='dark'
            onClick={() => {
              setPlaying((prev) => !prev);
            }}
          >
            <IonIcon
              slot='icon-only'
              icon={playing ? pause : play}
              style={{ height: '80%', width: '100%' }}
            />
          </IonButton>
          <IonButton
            size='large'
            fill='clear'
            shape='round'
            color='dark'
            onClick={() => {
              dispatch(stepForward());
            }}
          >
            <IonIcon slot='icon-only' icon={playForward} />
          </IonButton>
        </div>
        <div className={styles.footerGroup}>moment@art.ru</div>
      </footer>
    </div>
  );
}

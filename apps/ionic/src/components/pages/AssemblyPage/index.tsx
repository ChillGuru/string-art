import { IonButton, IonIcon } from '@ionic/react';
import { pause, play, playBack, playForward } from 'ionicons/icons';
import { useState } from 'react';
import { Redirect } from 'react-router';

import { Header } from '@/components/Layout/Header';
import { GeneratorService } from '@/modules/Generator/service';
import { stepBack, stepForward } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

const quarterClasses = [
  styles.sliceTopLeft,
  styles.sliceTopRight,
  styles.sliceBottomRight,
  styles.sliceBottomLeft,
];

export function AssemblyPage() {
  const steps = useAppSelector((s: RootState) => s.generator.layers);
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
        <h1>
          Шаг 4<br />
          Плетение
        </h1>
        <ol className={styles.list}>
          {new Array(5)
            .fill(0)
            .map((_, idx) => idx - Math.floor(5 / 2))
            .map((offset) => (
              <li key={offset}>
                {offset === 0 && (
                  <div className={styles.currentStep}>
                    <div
                      className={[
                        styles.slice,
                        quarterClasses[
                          GeneratorService.pinToQuarter(steps[curStep + offset])
                        ],
                      ].join(' ')}
                    >
                      <div className={styles.sliceSegment} />
                    </div>
                    <span className={styles.currentStepText}>
                      {steps[curStep + offset]}
                    </span>
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
          Шаг: {curStep + 1}/{steps.length}
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

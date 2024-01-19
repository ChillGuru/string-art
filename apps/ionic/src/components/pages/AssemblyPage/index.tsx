import { IonButton, IonIcon, IonPicker } from '@ionic/react';
import { chevronUp, pause, play, playBack, playForward } from 'ionicons/icons';
import { useState } from 'react';
import { Redirect } from 'react-router';

import { Footer } from '@/components/Layout/Footer';
import { Header } from '@/components/Layout/Header';
import { GeneratorService } from '@/modules/Generator/service';
import { stepBack, stepForward } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import { BackButton } from '@/components/BackButton';
import styles from './styles.module.scss';

const quarterClasses = [
  styles.sliceTopLeft,
  styles.sliceTopRight,
  styles.sliceBottomRight,
  styles.sliceBottomLeft,
];

const colorNames: Record<string, string> = {
  black: 'Чёрный',
  cyan: 'Голубой',
  magenta: 'Пурпурный',
  yellow: 'Жёлтый',
};

export function AssemblyPage() {
  const layers = useAppSelector((s: RootState) => s.generator.layers);

  const dispatch = useAppDispatch();

  const [playing, setPlaying] = useState(false);
  const [curColor, setCurColor] = useState('black');
  const curLayer = layers[curColor];

  if (curLayer === undefined) {
    return <Redirect to='/app' />;
  }

  return (
    <div className='container'>
      <Header></Header>
      <main className={styles.main}>
        <div className={styles.headingGroup}>
          <BackButton />
          <h1>
            Шаг 4<br />
            Плетение
          </h1>
        </div>
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
                          GeneratorService.pinToQuarter(
                            curLayer.steps[curLayer.currentStep + offset]
                          )
                        ],
                      ].join(' ')}
                    >
                      <div className={styles.sliceSegment} />
                    </div>
                    <span className={styles.currentStepText}>
                      {curLayer.steps[curLayer.currentStep + offset]}
                    </span>
                  </div>
                )}
                {offset !== 0 && (
                  <div className={styles.step}>
                    {curLayer.steps[curLayer.currentStep + offset]}
                  </div>
                )}
              </li>
            ))}
        </ol>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerGroup}>
          Шаг: {curLayer.currentStep} / {curLayer.steps.length - 1}
        </div>
        <div className={styles.footerGroup}>
          <IonButton id='pickColor' size='large' fill='outline' color='dark'>
            {colorNames[curColor]} Слой
            <IonIcon slot='end' icon={chevronUp} />
          </IonButton>
        </div>
        <IonPicker
          trigger='pickColor'
          buttons={[
            { text: 'Отмена', role: 'cancel' },
            {
              text: 'Выбрать',
              handler(value) {
                setCurColor(value.layers.value);
              },
            },
          ]}
          columns={[
            {
              name: 'layers',
              options: Object.keys(layers).map((color) => ({
                text:
                  colorNames[color] +
                  ' слой ' +
                  layers[color].currentStep +
                  ' / ' +
                  (layers[color].steps.length - 1),
                value: color,
              })),
            },
          ]}
        />
        <div className={styles.footerMainGroup}>
          <IonButton
            size='large'
            fill='clear'
            shape='round'
            color='dark'
            onClick={() => {
              dispatch(stepBack(curColor));
            }}
          >
            <IonIcon slot='icon-only' icon={playBack} />
          </IonButton>
          <IonButton
            size='large'
            shape='round'
            color='primary'
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
              dispatch(stepForward(curColor));
            }}
          >
            <IonIcon slot='icon-only' icon={playForward} />
          </IonButton>
        </div>
        <Footer />
      </footer>
    </div>
  );
}

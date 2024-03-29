import { IonButton, IonIcon, IonPicker } from '@ionic/react';
import { animated, useSpring } from '@react-spring/web';
import { chevronUp, pause, play, playBack, playForward } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { Redirect } from 'react-router';

import { BackButton } from '@/components/BackButton';
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

const colorNames: Record<string, string> = {
  black: 'Чёрный',
  cyan: 'Голубой',
  magenta: 'Пурпурный',
  yellow: 'Жёлтый',
};

const speeedMultipliers = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function AssemblyPage() {
  const layers = useAppSelector((s: RootState) => s.generator.layers);

  const dispatch = useAppDispatch();

  const [playing, setPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [curColor, setCurColor] = useState('black');
  const curLayer = layers[curColor];

  type TimeoutId = ReturnType<typeof setTimeout>;
  const playbackTimeout = useRef<TimeoutId | undefined>(undefined);

  const [stepSprings, animateSteps] = useSpring(() => ({
    from: { opacity: 0, y: 0 },
    to: { opacity: 1, y: 0 },
  }));

  const previousStep = useRef(0);
  useEffect(() => {
    if (previousStep.current < curLayer.currentStep) {
      animateSteps({
        from: { y: 30 },
        to: { y: 0 },
      });
    } else {
      animateSteps({ from: { y: -30 }, to: { y: 0 } });
    }
    previousStep.current = curLayer.currentStep;
  }, [curLayer.currentStep, animateSteps]);

  const bodySpring = useSpring({ from: { opacity: 0 }, to: { opacity: 1 } });

  function timer(mul: number) {
    playbackTimeout.current = setTimeout(() => {
      dispatch(stepForward(curColor));
      timer(mul);
    }, 2000 / mul);
  }

  function togglePlayback() {
    clearTimeout(playbackTimeout.current);
    if (!playing) {
      timer(speedMultiplier);
    }
    setPlaying((prev) => !prev);
  }

  function changeSpeed(mul: number) {
    if (!playing) {
      return;
    }
    clearTimeout(playbackTimeout.current);
    timer(mul);
  }

  if (curLayer === undefined) {
    return <Redirect to='/app' />;
  }

  return (
    <div className='container'>
      <Header></Header>
      <animated.main className={styles.main} style={{ ...bodySpring }}>
        <div className={styles.headingGroup}>
          <BackButton />
          <h4 className={styles.header}>
            Шаг 4<br />
            Плетение
          </h4>
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
                      <animated.div style={{ ...stepSprings }}>
                        {curLayer.steps[curLayer.currentStep + offset]}
                      </animated.div>
                    </span>
                  </div>
                )}
                {offset !== 0 && (
                  <animated.div
                    className={styles.step}
                    style={{ ...stepSprings }}
                  >
                    {curLayer.steps[curLayer.currentStep + offset]}
                  </animated.div>
                )}
              </li>
            ))}
        </ol>
      </animated.main>
      <animated.footer className={styles.footer} style={{ ...bodySpring }}>
        <div className={styles.footerGroup}>
          Шаг: {curLayer.currentStep} / {curLayer.steps.length - 1}
        </div>
        <div className={styles.footerSelectGroup}>
          <IonButton id='pickColor' fill='outline' color='dark'>
            <span style={{ width: '100%' }}>{colorNames[curColor]} Слой</span>
            <IonIcon slot='end' icon={chevronUp} />
          </IonButton>
          <IonButton id='pickSpeed' fill='outline' color='dark'>
            <span style={{ width: '100%' }}>Скорость {speedMultiplier}x</span>
            <IonIcon slot='end' icon={chevronUp} />
          </IonButton>
        </div>
        <IonPicker
          trigger='pickSpeed'
          onDidPresent={() => {
            if (playing) {
              togglePlayback();
            }
          }}
          buttons={[
            { text: 'Отмена', role: 'cancel' },
            {
              text: 'Выбрать',
              handler(value) {
                setSpeedMultiplier(value.speeds.value);
                changeSpeed(value.speeds.value);
              },
            },
          ]}
          columns={[
            {
              name: 'speeds',
              selectedIndex: speeedMultipliers.findIndex(
                (m) => m === speedMultiplier
              ),
              options: speeedMultipliers.map((s) => ({
                text: `${s}x`,
                value: s,
              })),
            },
          ]}
        />
        <IonPicker
          trigger='pickColor'
          onDidPresent={() => {
            if (playing) {
              togglePlayback();
            }
          }}
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
              selectedIndex: Object.keys(layers).findIndex(
                (l) => l === curColor
              ),
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
            shape='round'
            color='primary'
            onClick={() => {
              togglePlayback();
            }}
          >
            <IonIcon
              slot='icon-only'
              icon={playing ? pause : play}
              style={{ height: '80%', width: '100%' }}
            />
          </IonButton>
          <IonButton
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
        {/* <Footer /> */}
      </animated.footer>
    </div>
  );
}

import nj from '@d4c/numjs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonButton,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
} from '@ionic/react';
import { downloadOutline, refreshOutline } from 'ionicons/icons';
import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router';

import { BackButton } from '@/components/BackButton';
import { LoadingBody } from '@/components/Layout/LoadingBody';
import { OpenCV } from '@/helpers/openCv';
import {
  GeneratorForm,
  Tuple,
  generatorFormSchema,
} from '@/modules/Generator/models';
import { GeneratorService } from '@/modules/Generator/service';
import { setFinishedImg, setSteps } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

export default function GeneratorPage() {
  const { loaded, cv } = useOpenCv();

  const canvas = useRef<HTMLCanvasElement>(null);
  const generatorTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const croppedImgUrl = useAppSelector(
    (s: RootState) => s.generator.croppedImgUrl
  );
  const finishedImgUrl = useAppSelector(
    (s: RootState) => s.generator.finishedImgUrl
  );
  const dispatch = useAppDispatch();

  const [pending, setPending] = useState(false);

  function resetGenerator() {
    dispatch(setFinishedImg(undefined));
  }

  const generatorForm = useForm<GeneratorForm>({
    resolver: zodResolver(generatorFormSchema),
  });
  const onSubmit = generatorForm.handleSubmit((data) => {
    if (!cv) {
      console.log('OpenCV not loaded yet');
      return;
    }
    if (!canvas.current) {
      console.log('Canvas not specified');
      return;
    }
    if (data.type === 'color') {
      console.error('Цветные картинки не поддерживаются');
      return;
    }
    console.log(data);
    setPending(true);
    const canvasCur = canvas.current;
    generatorTimeout.current = setTimeout(() => {
      const IMG_SIZE = GeneratorService.getImgSize(canvasCur);
      const ctx = canvasCur.getContext('2d')!;
      const R = nj.ones([IMG_SIZE, IMG_SIZE]).multiply(255); // ?
      const rData: number[] = []; // ?
      // make image black & white
      const imgPixels = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
      for (let y = 0; y < imgPixels.height; y++) {
        for (let x = 0; x < imgPixels.width; x++) {
          const idx = x * 4 + y * 4 * imgPixels.width;
          let avg =
            imgPixels.data[idx] +
            imgPixels.data[idx + 1] +
            imgPixels.data[idx + 2];
          avg /= 3;
          imgPixels.data[idx] = avg;
          imgPixels.data[idx + 1] = avg;
          imgPixels.data[idx + 2] = avg;
          rData.push(avg);
        }
      }
      R.selection.data = rData;
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      ctx.putImageData(imgPixels, 0, 0, 0, 0, IMG_SIZE, IMG_SIZE);

      const coords = GeneratorService.calculatePinCoords(
        data.pinCount,
        IMG_SIZE
      );
      console.log('Координаты высчитаны');

      const lineRes = GeneratorService.calculateLines(
        data.pinCount,
        data.minInterval,
        coords
      );
      console.log('Линии высчитаны');

      drawLines(cv, canvasCur, coords, IMG_SIZE, data);
      function drawLines(
        cv: OpenCV,
        canvas: HTMLCanvasElement,
        coords: Tuple[],
        imgSize: number,
        {
          pinCount,
          scale,
          maxLines,
          minInterval,
          lineWeight,
          hoopDiameter,
        }: GeneratorForm
      ) {
        const error = nj
          .ones([imgSize, imgSize])
          .multiply(255)
          .subtract(
            nj.uint8(R.selection.data as number[]).reshape(imgSize, imgSize)
          );
        const arr = nj.ones([imgSize * scale, imgSize * scale]).multiply(255);
        const result = cv.matFromArray(
          imgSize * scale,
          imgSize * scale,
          cv.CV_8UC1,
          arr.selection.data
        );
        // const imgResult = nj.ones([imgSize, imgSize]).multiply(255);
        // const lineMask = nj.zeros([imgSize, imgSize], 'float64');

        let currentPin = 0,
          threadLength = 0,
          i = 0;
        const steps: number[] = [currentPin];
        const lastPins: number[] = [];

        function recursiveFn() {
          if (i >= maxLines) {
            //finalise
            console.log('Рисование закончено', steps);
            const ctx = canvas.getContext('2d')!;
            GeneratorService.cropCircle(ctx, canvas.height);

            canvas.toBlob((blob) => {
              if (!blob) {
                console.error('Unable to create blob from finished img');
                return;
              }
              const strSteps = steps.map((s) =>
                GeneratorService.pinToStr(s, pinCount)
              );
              console.log(strSteps);
              dispatch(setSteps(strSteps));
              dispatch(setFinishedImg(blob));
              setPending(false);
            });
            return;
          }
          if (i % 10 === 0) {
            //draw
            const dsize = new cv.Size(imgSize * 2, imgSize * 2);
            const dst = new cv.Mat();
            cv.resize(result, dst, dsize, 0, 0, cv.INTER_AREA);
            cv.imshow(canvas, dst);
            dst.delete();
          }
          let maxError = -1,
            bestPin = -1;
          for (
            let offset = minInterval;
            offset < pinCount - minInterval;
            offset++
          ) {
            const testPin = (currentPin + offset) % pinCount;
            if (lastPins.includes(testPin)) {
              continue;
            }
            const xs = lineRes.lineCacheX[testPin * pinCount + currentPin];
            const ys = lineRes.lineCacheY[testPin * pinCount + currentPin];
            const lineErr =
              GeneratorService.getLineErr(error, ys, xs) *
              lineRes.lineCacheWeight[testPin * pinCount + currentPin];
            if (lineErr > maxError) {
              maxError = lineErr;
              bestPin = testPin;
            }
          }
          steps.push(bestPin);
          const xs = lineRes.lineCacheX[bestPin * pinCount + currentPin];
          const ys = lineRes.lineCacheY[bestPin * pinCount + currentPin];
          const weight =
            lineWeight *
            lineRes.lineCacheWeight[bestPin * pinCount + currentPin];

          const lineMask = GeneratorService.createLine(
            nj.zeros([imgSize, imgSize], 'float64'),
            ys,
            xs,
            weight
          );
          GeneratorService.subtractArrays(error, lineMask);

          const x0 = coords[currentPin][0];
          const y0 = coords[currentPin][1];
          const ptCur = new cv.Point(x0 * scale, y0 * scale);

          const x1 = coords[bestPin][0];
          const y1 = coords[bestPin][1];
          const ptNext = new cv.Point(x1 * scale, y1 * scale);

          cv.line(
            result,
            ptCur,
            ptNext,
            new cv.Scalar(0, 0, 0),
            Math.floor(lineWeight / 10),
            cv.LINE_AA,
            0
          );
          const distance = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
          threadLength += (hoopDiameter / imgSize) * distance;

          lastPins.push(bestPin);
          if (lastPins.length > minInterval) {
            lastPins.shift();
          }
          currentPin = bestPin;
          i++;
          generatorTimeout.current = setTimeout(recursiveFn, 0);
        }
        recursiveFn();
      }
    }, 0);
  });

  useEffect(() => {
    if (!canvas.current) {
      console.log('Canvas not specified');
      return;
    }
    if (!croppedImgUrl) {
      console.log('Image not specified');
      return;
    }
    if (!cv) {
      console.log('OpenCV not loaded yet');
      return;
    }
    const IMG_SIZE = GeneratorService.getImgSize(canvas.current);
    const ctx = canvas.current.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded!');
      ctx.canvas.width = IMG_SIZE;
      ctx.canvas.height = IMG_SIZE;
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, IMG_SIZE, IMG_SIZE);

      GeneratorService.cropCircle(ctx, IMG_SIZE);
    };
    if (!finishedImgUrl) {
      img.src = croppedImgUrl;
    } else {
      img.src = finishedImgUrl;
    }

    return () => {
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
    };
  }, [cv, croppedImgUrl, finishedImgUrl]);

  useEffect(() => {
    const timeoutId = generatorTimeout.current;
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const genState = GeneratorService.getGeneratorState(
    pending,
    !!finishedImgUrl
  );

  if (!croppedImgUrl) {
    return <Redirect to='/app/crop' />;
  }

  if (!loaded) {
    return <LoadingBody />;
  }

  return (
    <main className={styles.main}>
      <h1>
        Шаг 3<br />
        Начинаем генерацию образца
      </h1>
      <canvas ref={canvas} className={styles.imgDisplay} />
      <form onSubmit={onSubmit} className={styles.form}>
        {genState === 'finished' && <h2>Образец готов!</h2>}
        {genState === 'idle' && (
          <>
            <h2>Настройте параметры образца</h2>
            <IonRadioGroup value={'bw'} className={styles.radioGroup}>
              <IonRadio
                labelPlacement='end'
                value={'bw'}
                {...generatorForm.register('type')}
              >
                Чёрно-белый
              </IonRadio>
              <IonRadio
                labelPlacement='end'
                disabled
                value={'color'}
                {...generatorForm.register('type')}
              >
                Цветной
              </IonRadio>
            </IonRadioGroup>
          </>
        )}
        <div className={styles.btnGroup}>
          <BackButton backUrl='/app/crop' />
          {genState === 'idle' && (
            <IonButton type='submit' size='large' shape='round'>
              Начать генерацию
            </IonButton>
          )}
          {genState === 'pending' && (
            <IonButton type='button' disabled size='large' shape='round'>
              Обработка
              <IonSpinner slot='end' name='dots' />
            </IonButton>
          )}
          {genState === 'finished' && (
            <>
              <IonButton type='button' size='large' shape='round'>
                Плести
              </IonButton>
              <IonButton
                type='button'
                size='large'
                shape='round'
                fill='outline'
                disabled
              >
                <IonIcon icon={downloadOutline} slot='start' />
                PDF
              </IonButton>
            </>
          )}
        </div>
        {genState === 'finished' && (
          <div className={styles.btnGroup}>
            <div />
            <IonButton
              type='button'
              size='large'
              shape='round'
              fill='outline'
              onClick={resetGenerator}
            >
              <IonIcon icon={refreshOutline} size='large' slot='end' />
              Сбросить
            </IonButton>
          </div>
        )}
      </form>
    </main>
  );
}

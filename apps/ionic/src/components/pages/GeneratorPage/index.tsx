import nj from '@d4c/numjs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonButton,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  useIonRouter,
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
  GeneratorLayerData,
  LineResult,
  Tuple,
  generatorFormSchema,
} from '@/modules/Generator/models';
import { GeneratorService } from '@/modules/Generator/service';
import { setFinishedImg, setSteps } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

export default function GeneratorPage() {
  const router = useIonRouter();
  const { loaded, cv } = useOpenCv();

  const canvas = useRef<HTMLCanvasElement>(null);

  type TimeoutId = ReturnType<typeof setTimeout>;
  const generatorTimeout = useRef<TimeoutId | undefined>(undefined);
  const generatorInnerTimeout = useRef<TimeoutId | undefined>(undefined);

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
  const onSubmit = generatorForm.handleSubmit((formData) => {
    if (!cv) {
      console.log('OpenCV not loaded yet');
      return;
    }
    if (!canvas.current) {
      console.log('Canvas not specified');
      return;
    }
    // if (formData.mode === 'color') {
    //   console.error('Цветные картинки не поддерживаются');
    //   return;
    // }
    console.log(formData);
    setPending(true);

    const canvasCur = canvas.current;
    const IMG_SIZE = GeneratorService.getImgSize(canvasCur);

    const coords = GeneratorService.calculatePinCoords(
      formData.pinCount,
      IMG_SIZE
    );
    console.log('Координаты высчитаны');

    const lineRes = GeneratorService.calculateLines(
      formData.pinCount,
      formData.minInterval,
      coords
    );
    console.log('Линии высчитаны');

    setTimeout(() => {
      const imgMat = cv.imread(canvasCur);
      const layers: GeneratorLayerData[] = [];

      switch (formData.mode) {
        case 'bw': {
          const grayscaleImgMat = new cv.Mat();
          cv.cvtColor(imgMat, grayscaleImgMat, cv.COLOR_RGB2GRAY);

          layers.push({
            color: 'black',
            colorRgb: [0, 0, 0],
            layerImgData: new Uint8Array(grayscaleImgMat.data),
          });
          break;
        }
        case 'color': {
          // basically this
          // https://gist.github.com/wyudong/9c392578c6247e7d1d28
          const rgb = new cv.MatVector();
          cv.split(imgMat, rgb);

          const rLayer = rgb.get(0);
          const gLayer = rgb.get(1);
          const bLayer = rgb.get(2);

          const cmykAsRgbLayers = Array.from({ length: 4 }, () => new cv.Mat());
          cmykAsRgbLayers.forEach((layer) =>
            layer.create(imgMat.rows, imgMat.cols, cv.CV_8UC3)
          );

          // loop over image and convert each pixel
          for (let i = 0; i < imgMat.rows; i++) {
            for (let j = 0; j < imgMat.cols; j++) {
              const r = rLayer.ucharPtr(i, j)[0];
              const g = gLayer.ucharPtr(i, j)[0];
              const b = bLayer.ucharPtr(i, j)[0];

              const [c, m, y, k] = GeneratorService.rgb2cmyk(r, g, b);
              const cAsRgb = GeneratorService.cmyk2rgb(c, 0, 0, 0);
              const mAsRgb = GeneratorService.cmyk2rgb(0, m, 0, 0);
              const yAsRgb = GeneratorService.cmyk2rgb(0, 0, y, 0);
              const kAsRgb = GeneratorService.cmyk2rgb(0, 0, 0, k);

              for (let n = 0; n < 3; n++) {
                cmykAsRgbLayers[0].ucharPtr(i, j)[n] = cAsRgb[n];
                cmykAsRgbLayers[1].ucharPtr(i, j)[n] = mAsRgb[n];
                cmykAsRgbLayers[2].ucharPtr(i, j)[n] = yAsRgb[n];
                cmykAsRgbLayers[3].ucharPtr(i, j)[n] = kAsRgb[n];
              }
            }
          }

          const cmykAsGrayLayers = Array.from(
            { length: 4 },
            () => new cv.Mat()
          );
          for (let i = 0; i < cmykAsRgbLayers.length; i++) {
            cv.cvtColor(
              cmykAsRgbLayers[i],
              cmykAsGrayLayers[i],
              cv.COLOR_RGB2GRAY
            );
            cmykAsRgbLayers[i].delete();
          }

          layers.push(
            {
              color: 'black',
              colorRgb: [0, 0, 0],
              // this prevents a dangling pointer
              layerImgData: new Uint8Array(cmykAsGrayLayers[3].data),
            },
            {
              color: 'cyan',
              colorRgb: [130, 255, 255],
              layerImgData: new Uint8Array(cmykAsGrayLayers[0].data),
            },
            {
              color: 'magenta',
              colorRgb: [255, 130, 255],
              layerImgData: new Uint8Array(cmykAsGrayLayers[1].data),
            },
            {
              color: 'yellow',
              colorRgb: [255, 255, 130],
              layerImgData: new Uint8Array(cmykAsGrayLayers[2].data),
            }
          );

          rgb.delete();
          cmykAsGrayLayers.forEach((l) => l.delete());
          break;
        }
        default:
          throw new Error('Invalid generator mode');
      }

      // const ctx = canvasCur.getContext('2d')!;
      // const imgPixels = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
      // const imgData = GeneratorService.makeGrayscale(imgPixels);
      // ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      // ctx.putImageData(imgPixels, 0, 0, 0, 0, IMG_SIZE, IMG_SIZE);

      let layerIdx = 0;
      generatorTimeout.current = setTimeout(() => {
        drawLines(
          cv,
          canvasCur,
          coords,
          IMG_SIZE,
          lineRes,
          layers[layerIdx],
          formData
        );
      }, 0);
      function drawLines(
        cv: OpenCV,
        canvas: HTMLCanvasElement,
        coords: Tuple[],
        imgSize: number,
        lineResult: LineResult,
        layerData: GeneratorLayerData,
        formData: GeneratorForm
      ) {
        const { color, colorRgb, layerImgData } = layerData;
        const {
          pinCount,
          scale,
          maxLines,
          minInterval,
          lineWeight,
          hoopDiameter,
        } = formData;

        const error = nj
          .ones([imgSize, imgSize])
          .multiply(255)
          //@ts-ignore
          .subtract(nj.uint8(layerImgData).reshape(imgSize, imgSize));
        const result = cv.matFromArray(
          imgSize * scale,
          imgSize * scale,
          cv.CV_8UC3,
          []
        );
        // fill result with white
        result.setTo(new cv.Scalar(255, 255, 255));
        // const imgResult = nj.ones([imgSize, imgSize]).multiply(255);
        // const lineMask = nj.zeros([imgSize, imgSize], 'float64');

        let currentPin = 0,
          threadLength = 0,
          i = 0;
        const steps: number[] = [currentPin];
        const lastPins: number[] = [];

        generatorInnerTimeout.current = setTimeout(recursiveFn, 0);
        function recursiveFn() {
          if (i >= maxLines) {
            if (layerIdx + 1 >= layers.length) {
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

            layerIdx++;
            generatorTimeout.current = setTimeout(() => {
              drawLines(
                cv,
                canvasCur,
                coords,
                IMG_SIZE,
                lineRes,
                layers[layerIdx],
                formData
              );
            }, 0);
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
            const xs = lineResult.lineCacheX[testPin * pinCount + currentPin];
            const ys = lineResult.lineCacheY[testPin * pinCount + currentPin];
            const lineErr =
              GeneratorService.getLineErr(error, ys, xs) *
              lineResult.lineCacheWeight[testPin * pinCount + currentPin];
            if (lineErr > maxError) {
              maxError = lineErr;
              bestPin = testPin;
            }
          }
          steps.push(bestPin);
          const xs = lineResult.lineCacheX[bestPin * pinCount + currentPin];
          const ys = lineResult.lineCacheY[bestPin * pinCount + currentPin];
          const weight =
            lineWeight *
            lineResult.lineCacheWeight[bestPin * pinCount + currentPin];

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
            new cv.Scalar(...colorRgb),
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

          generatorInnerTimeout.current = setTimeout(recursiveFn, 0);
        }
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
    return () => {
      clearTimeout(generatorTimeout.current);
    };
  }, []);

  const genState = GeneratorService.getGeneratorState(
    pending,
    !!finishedImgUrl
  );

  if (!croppedImgUrl) {
    return <Redirect to='/app/crop' />;
  }

  if (!loaded || !cv) {
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
                {...generatorForm.register('mode')}
              >
                Чёрно-белый
              </IonRadio>
              <IonRadio
                labelPlacement='end'
                value={'color'}
                {...generatorForm.register('mode')}
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
              <IonButton
                type='button'
                size='large'
                shape='round'
                onClick={() => {
                  router.push('/app/assembly', 'forward');
                }}
              >
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

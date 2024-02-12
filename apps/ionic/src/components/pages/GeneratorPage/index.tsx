import nj from '@d4c/numjs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonButton,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  useIonAlert,
  useIonRouter,
} from '@ionic/react';
import { download, refreshOutline } from 'ionicons/icons';
import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router';

import { BackButton } from '@/components/BackButton';
import { LoadingBody } from '@/components/Layout/LoadingBody';
import { OpenCV } from '@/helpers/openCv';
import { hideSaveImgAlert } from '@/modules/Alerts/slice';
import { EncodingService } from '@/modules/Encoding/service';
import {
  AssemblyLayerData,
  ExportableLayerData,
  GeneratorForm,
  GeneratorLayerData,
  GeneratorMode,
  LineResult,
  Tuple,
  generatorFormSchema,
} from '@/modules/Generator/models';
import { GeneratorService } from '@/modules/Generator/service';
import { setFinishedImg, setLayers } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

const modeCssFilters: Record<GeneratorMode, string> = {
  bw: styles.grayscale,
  color: '',
} as const;

const modeTranslations: Record<GeneratorMode, string> = {
  bw: 'ЧБ',
  color: 'Цветной',
} as const;

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
  const layers = useAppSelector((s: RootState) => s.generator.layers);
  const saveImgAlertSeen = useAppSelector(
    (s: RootState) => s.alerts.saveImgAlertSeen
  );
  const dispatch = useAppDispatch();

  const [pending, setPending] = useState(false);
  const [curLayer, setCurLayer] = useState(0);
  const [maxLayer, setMaxLayer] = useState(0);

  const generatorForm = useForm<GeneratorForm>({
    resolver: zodResolver(generatorFormSchema),
  });

  function resetGenerator() {
    dispatch(setFinishedImg(undefined));
    generatorForm.setValue('mode', 'bw');
  }

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

    generatorTimeout.current = setTimeout(() => {
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
            maxLines: formData.maxLines,
          });
          grayscaleImgMat.delete();
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
              // copying the data to prevent a dangling pointer
              layerImgData: new Uint8Array(cmykAsGrayLayers[3].data),
              maxLines: formData.maxLines,
            },
            {
              color: 'cyan',
              colorRgb: [130, 255, 255],
              layerImgData: new Uint8Array(cmykAsGrayLayers[0].data),
              maxLines: formData.maxLines / 4,
            },
            {
              color: 'magenta',
              colorRgb: [255, 130, 255],
              layerImgData: new Uint8Array(cmykAsGrayLayers[1].data),
              maxLines: formData.maxLines / 4,
            },
            {
              color: 'yellow',
              colorRgb: [255, 255, 130],
              layerImgData: new Uint8Array(cmykAsGrayLayers[2].data),
              maxLines: formData.maxLines / 4,
            }
          );

          rgb.delete();
          cmykAsGrayLayers.forEach((l) => l.delete());
          break;
        }
        default:
          throw new Error('Invalid generator mode');
      }
      imgMat.delete();
      setMaxLayer(layers.length);

      // const ctx = canvasCur.getContext('2d')!;
      // const imgPixels = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
      // const imgData = GeneratorService.makeGrayscale(imgPixels);
      // ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      // ctx.putImageData(imgPixels, 0, 0, 0, 0, IMG_SIZE, IMG_SIZE);

      let layerIdx = 0;
      const resLayers: Record<string, AssemblyLayerData> = {};
      generatorTimeout.current = setTimeout(() => {
        setCurLayer(layerIdx);
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
        const { color, colorRgb, layerImgData, maxLines } = layerData;
        const { mode, pinCount, scale, minInterval, lineWeight, hoopDiameter } =
          formData;

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
            // save layer
            const resultMat = cv.imread(canvas);
            const strSteps = steps.map((s) =>
              GeneratorService.pinToStr(s, pinCount)
            );
            console.log(`Рисование слоя ${layerIdx} закончено`, steps);
            resLayers[color] = {
              color,
              colorRgb,
              steps: strSteps,
              currentStep: 0,
              layerImgData: new Uint8Array(resultMat.data),
            };
            resultMat.delete();
            result.delete();

            if (layerIdx + 1 >= layers.length) {
              // finalise
              const ctx = canvas.getContext('2d')!;
              const resSize = imgSize * 2;

              switch (mode) {
                case 'bw': {
                  const bwLayer = resLayers['black'];
                  const mat = cv.matFromArray(
                    resSize,
                    resSize,
                    cv.CV_8UC4,
                    bwLayer.layerImgData
                  );
                  cv.cvtColor(mat, mat, cv.COLOR_RGBA2RGB);
                  cv.imshow(canvas, mat);
                  mat.delete();
                  break;
                }
                case 'color': {
                  const cmykMats = [new cv.Mat()];
                  cmykMats.pop()!.delete();

                  // this is how you combine cmyk layers together
                  // https://en.wikipedia.org/wiki/Blend_modes#Multiply
                  for (const color of ['cyan', 'magenta', 'yellow', 'black']) {
                    const mat = cv.matFromArray(
                      resSize,
                      resSize,
                      cv.CV_8UC4,
                      resLayers[color].layerImgData
                    );
                    cv.cvtColor(mat, mat, cv.COLOR_RGBA2RGB);
                    // convert 0-255 values to 0.0f-1.0f
                    mat.convertTo(mat, cv.CV_32FC3, 1 / 255);
                    cmykMats.push(mat);
                  }

                  const combinedMat = cv.matFromArray(
                    resSize,
                    resSize,
                    cv.CV_32FC3,
                    []
                  );
                  combinedMat.setTo(new cv.Scalar(1.0, 1.0, 1.0));
                  for (let i = 0; i < cmykMats.length; i++) {
                    cv.multiply(combinedMat, cmykMats[i], combinedMat);
                    cmykMats[i].delete();
                  }
                  cv.imshow(canvas, combinedMat);
                  combinedMat.delete();
                  break;
                }
                default:
                  throw new Error('Неверный режим генератора');
              }

              GeneratorService.cropCircle(ctx, canvas.height);
              canvas.toBlob((blob) => {
                if (!blob) {
                  console.error('Unable to create blob from finished img');
                  return;
                }
                console.log(strSteps);
                dispatch(setFinishedImg(blob));
                dispatch(setLayers(resLayers));
                setPending(false);
              });
              return;
            }

            layerIdx++;
            generatorTimeout.current = setTimeout(() => {
              setCurLayer(layerIdx);
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
      clearTimeout(generatorInnerTimeout.current);
    };
  }, []);

  const [showAlert] = useIonAlert();

  async function downloadStuff() {
    if (!finishedImgUrl) {
      console.error('No image to download');
      return;
    }

    const download = async () => {
      const metadata: Record<string, ExportableLayerData> = {};
      for (const [key, val] of Object.entries(layers)) {
        metadata[key] = {
          color: val.color,
          colorRgb: val.colorRgb,
          steps: val.steps,
        };
      }
      console.log({ metadata });

      const blob = await EncodingService.urlToBlob(finishedImgUrl);
      const b64 = await EncodingService.blobToBase64(blob);

      const newB64 = EncodingService.appendMetadata(b64, metadata);
      const newBlob = await EncodingService.urlToBlob(newB64);

      const url = URL.createObjectURL(newBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const dateStr = Date.now() + '';
      const id = dateStr.substring(dateStr.length - 6);
      anchor.download = `Образец ${id}`;
      anchor.click();
      URL.revokeObjectURL(url);
    };

    if (saveImgAlertSeen) {
      return download();
    }

    showAlert({
      header: 'Сохранить изображение',
      subHeader: `Сохранённое изображение 
            будет содержать в себе шаги плетения`,
      message: `Импортировать в интерактивную инструкцию 
            их можно при загрузке сохранённого изображения`,
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          handler(value: boolean[]) {
            console.log({ value });
            if (value[0]) {
              dispatch(hideSaveImgAlert());
            }
            download();
          },
        },
        {
          text: 'Отмена',
          role: 'cancel',
        },
      ],
      inputs: [
        {
          type: 'checkbox',
          name: 'hide',
          label: 'Не показывать снова',
          value: true,
        },
      ],
    });
  }

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
    <>
      <h4 className={styles.header}>
        Шаг 3<br />
        Начинаем генерацию образца
      </h4>
      <canvas ref={canvas} className={[styles.imgDisplay].join(' ')} />
      <form onSubmit={onSubmit} className={styles.form}>
        {genState === 'pending' && maxLayer > 0 && (
          <span>
            Слой: {curLayer + 1} / {maxLayer}
          </span>
        )}
        {genState === 'finished' && <span>Образец готов!</span>}
        {genState === 'idle' && (
          <>
            <span>Настройте параметры образца</span>
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
            <IonButton type='submit' shape='round'>
              Начать генерацию
            </IonButton>
          )}
          {genState === 'pending' && (
            <IonButton type='button' disabled shape='round'>
              Обработка
              <IonSpinner slot='end' name='dots' />
            </IonButton>
          )}
          {genState === 'finished' && (
            <>
              <IonButton
                type='button'
                shape='round'
                onClick={() => {
                  router.push('/app/assembly', 'forward');
                }}
              >
                Плести
              </IonButton>
              <IonButton
                type='button'
                shape='round'
                fill='outline'
                onClick={() => {
                  downloadStuff();
                }}
              >
                <IonIcon icon={download} slot='icon-only' />
              </IonButton>
            </>
          )}
        </div>
        {genState === 'finished' && (
          <div className={styles.btnGroup}>
            <div />
            <IonButton
              type='button'
              shape='round'
              fill='outline'
              color='dark'
              onClick={resetGenerator}
            >
              <IonIcon icon={refreshOutline} slot='end' />
              Сбросить
            </IonButton>
          </div>
        )}
      </form>
    </>
  );
}

import nj from '@d4c/numjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { IonButton } from '@ionic/react';
import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router';

import { OpenCV } from '@/helpers/openCv';
import {
  GeneratorForm,
  Tuple,
  generatorFormSchema,
} from '@/modules/Generator/models';
import { GeneratorService } from '@/modules/Generator/service';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

export default function GeneratorPage() {
  const MAX_LINES = 4000;
  const PIN_COUNT = 288;
  const HOOP_DIAMETER = 0.625;
  const LINE_WEIGHT = 20;
  const MIN_DISTANCE = 20;
  const SCALE = 20;

  const { loaded, cv } = useOpenCv();

  const canvas = useRef<HTMLCanvasElement>(null);

  const croppedImgUrl = useAppSelector(
    (s: RootState) => s.generator.croppedImgUrl
  );

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
    const IMG_SIZE = GeneratorService.getImgSize(canvas.current);
    const ctx = canvas.current.getContext('2d')!;
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

    const coords = GeneratorService.calculatePinCoords(PIN_COUNT, IMG_SIZE);
    console.log('Координаты высчитаны');

    const lineRes = GeneratorService.calculateLines(
      PIN_COUNT,
      MIN_DISTANCE,
      coords
    );
    console.log('Линии высчитаны');

    function drawLines(
      cv: OpenCV,
      canvas: HTMLCanvasElement,
      coords: Tuple[],
      imgSize: number,
      pinCount: number,
      scale: number,
      maxLines: number,
      minDistance: number,
      lineWeight: number,
      hoopDiameter: number
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
      const lineSequence: number[] = [currentPin];
      const lastPins: number[] = [];

      function recursiveFn() {
        if (i >= maxLines) {
          console.log('Рисование закончено');
          GeneratorService.cropCircle(canvas.getContext('2d')!, canvas.height);
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
          let offset = minDistance;
          offset < pinCount - minDistance;
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
        lineSequence.push(bestPin);
        const xs = lineRes.lineCacheX[bestPin * pinCount + currentPin];
        const ys = lineRes.lineCacheY[bestPin * pinCount + currentPin];
        const weight =
          lineWeight * lineRes.lineCacheWeight[bestPin * pinCount + currentPin];

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
          2,
          cv.LINE_AA,
          0
        );
        const distance = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
        threadLength += (hoopDiameter / imgSize) * distance;

        lastPins.push(bestPin);
        if (lastPins.length > minDistance) {
          lastPins.shift();
        }
        currentPin = bestPin;
        i++;
        setTimeout(recursiveFn, 0);
      }
      recursiveFn();
    }
    drawLines(
      cv,
      canvas.current,
      coords,
      IMG_SIZE,
      PIN_COUNT,
      SCALE,
      MAX_LINES,
      MIN_DISTANCE,
      LINE_WEIGHT,
      HOOP_DIAMETER
    );
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
    img.src = croppedImgUrl;

    return () => {
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
    };
  }, [cv, croppedImgUrl]);

  if (!croppedImgUrl) {
    return <Redirect to='/app/crop' />;
  }

  return (
    <main>
      <h1>Начинаем плетение</h1>
      {loaded ? 'opencv loaded' : 'opencv loading'}
      <canvas ref={canvas} className={styles.imgDisplay} />
      <form onSubmit={onSubmit}>
        <label>
          <input
            type='radio'
            {...generatorForm.register('type')}
            value='bw'
            checked
          />
          Чёрно-белая картинка
        </label>
        <label>
          <input
            type='radio'
            {...generatorForm.register('type')}
            value='color'
            disabled
          />
          Цветная картинка
        </label>
        <IonButton type='submit' size='large'>
          Начать генерацию
        </IonButton>
      </form>
    </main>
  );
}

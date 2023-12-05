import nj from '@d4c/numjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { IonButton } from '@ionic/react';
import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router';

import { GeneratorForm, generatorFormSchema } from '@/modules/Generator/models';
import { GeneratorService } from '@/modules/Generator/service';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

export function GeneratorPage() {
  const PIN_COUNT = 288;
  const MIN_DISTANCE = 20;

  const { loaded, cv } = useOpenCv();

  const canvas = useRef<HTMLCanvasElement>(null);

  const croppedImgUrl = useAppSelector(
    (s: RootState) => s.generator.croppedImgUrl
  );

  const generatorForm = useForm<GeneratorForm>({
    resolver: zodResolver(generatorFormSchema),
  });
  const onSubmit = generatorForm.handleSubmit((data) => {
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
    // make image black & white
    const R = nj.ones([IMG_SIZE, IMG_SIZE]).multiply(255); // ?
    const rData: number[] = []; // ?
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

    function precalculateLines(pinCount: number, minDistance: number) {
      console.log('Высчитываем линии');
      const cacheSize = pinCount ** 2;
      const lineCacheY = new Array<number[]>(cacheSize);
      const lineCacheX = new Array<number[]>(cacheSize);
      const lineCacheLength = new Array<number>(cacheSize).fill(0);
      const lineCacheWeight = new Array<number>(cacheSize).fill(1);
      for (let cur = 0; cur < pinCount; cur++) {
        for (let next = cur + minDistance; next < pinCount; next++) {
          const x0 = coords[cur][0],
            y0 = coords[cur][1],
            x1 = coords[next][0],
            y1 = coords[next][1];
          const dist = Math.floor(
            Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
          );
          const xs = GeneratorService.linspace(x0, x1, dist);
          const ys = GeneratorService.linspace(y0, y1, dist);

          lineCacheY[next * pinCount + cur] = ys;
          lineCacheY[cur * pinCount + next] = ys;

          lineCacheX[next * pinCount + cur] = xs;
          lineCacheX[cur * pinCount + next] = xs;

          lineCacheLength[next * pinCount + cur] = dist;
          lineCacheLength[cur * pinCount + next] = dist;
        }
      }
      console.log('Линии высчитаны');
    }
    precalculateLines(PIN_COUNT, MIN_DISTANCE);
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
      // cut out circle
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(IMG_SIZE / 2, IMG_SIZE / 2, IMG_SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
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
    <div>
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
        <IonButton type='submit'>Начать генерацию</IonButton>
      </form>
    </div>
  );
}

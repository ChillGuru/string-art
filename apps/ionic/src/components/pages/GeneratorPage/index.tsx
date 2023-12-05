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
    ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
    ctx.putImageData(imgPixels, 0, 0, 0, 0, IMG_SIZE, IMG_SIZE);

    const coords = GeneratorService.calculatePinCoords(PIN_COUNT, IMG_SIZE);
    console.log(coords);
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

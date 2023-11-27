import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef } from 'react';
import { Redirect } from 'react-router';

import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import styles from './styles.module.scss';

export function GeneratorPage() {
  const { loaded, cv } = useOpenCv();

  const canvas = useRef<HTMLCanvasElement>(null);

  const croppedImgUrl = useAppSelector(
    (s: RootState) => s.generator.croppedImgUrl
  );

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
    const IMG_SIZE = Math.min(500, canvas.current.clientWidth);
    const ctx = canvas.current.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded!');
      ctx.canvas.width = IMG_SIZE;
      ctx.canvas.height = IMG_SIZE;
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, IMG_SIZE, IMG_SIZE);
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
    </div>
  );
}

import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { Redirect } from 'react-router';

import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import '@/styles/cropper.scss';
import styles from './styles.module.scss';

export function GeneratorPage() {
  const { loaded, cv } = useOpenCv();

  const imgUrl = useAppSelector((r: RootState) => r.generator.imgUrl);

  const canvas = useRef<HTMLCanvasElement>(null);
  const cropper = useRef<ReactCropperElement>(null);

  useEffect(() => {
    if (!canvas.current) {
      console.log('Canvas not specified');
      return;
    }
    if (!imgUrl) {
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
    img.src = imgUrl;

    return () => {
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
    };
  }, [cv, imgUrl]);

  if (!imgUrl) {
    return <Redirect to='/app' />;
  }

  return (
    <div>
      {loaded ? 'opencv loaded' : 'opencv loading'}
      <h1>Обрежьте изображение по кругу</h1>
      <Cropper
        ref={cropper}
        className={styles.cropper}
        viewMode={3}
        dragMode='move'
        aspectRatio={1}
        cropBoxMovable={false}
        cropBoxResizable={false}
        src={imgUrl}
        autoCropArea={1}
        background={false}
        guides
      />
      {/* <canvas ref={canvas} /> */}
    </div>
  );
}

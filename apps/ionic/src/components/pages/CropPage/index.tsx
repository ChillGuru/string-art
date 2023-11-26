import { IonButton, useIonRouter } from '@ionic/react';
import { useOpenCv } from 'opencv-react-ts';
import { useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { Redirect } from 'react-router';

import { setCroppedImgUrl } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import '@/styles/cropper.scss';
import styles from './styles.module.scss';

export function CropPage() {
  const { loaded, cv } = useOpenCv();
  const imgUrl = useAppSelector((r: RootState) => r.generator.imgUrl);
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const canvas = useRef<HTMLCanvasElement>(null);
  const cropper = useRef<ReactCropperElement>(null);
  /*
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
  */

  const onCrop = () => {
    if (!cropper.current) {
      console.log("Can't crop because cropper element is not defined");
      return;
    }
    cropper.current.cropper.getCroppedCanvas().toBlob((blob) => {
      if (!blob) return console.log('Unable to create cropped img blob');
      dispatch(setCroppedImgUrl(blob));
      router.push('/app/generator', 'forward');
    });
  };

  if (!imgUrl) {
    return <Redirect to='/app' />;
  }

  return (
    <div style={{ overflowY: 'scroll' }}>
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
      <IonButton size='large' onClick={onCrop}>
        Обрезать
      </IonButton>
      <canvas ref={canvas} />
    </div>
  );
}

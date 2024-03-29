import { IonButton, useIonRouter } from '@ionic/react';
import { useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { Redirect } from 'react-router';

import { BackButton } from '@/components/BackButton';
import { setCroppedImg } from '@/modules/Generator/slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import '@/styles/cropper.scss';
import styles from './styles.module.scss';

export function CropPage() {
  const imgUrl = useAppSelector((s: RootState) => s.generator.imgUrl);
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const cropper = useRef<ReactCropperElement>(null);

  const onCrop = () => {
    if (!cropper.current) {
      console.log("Can't crop because cropper element is not defined");
      return;
    }
    cropper.current.cropper.getCroppedCanvas().toBlob((blob) => {
      if (!blob) {
        console.error('Unable to create blob from cropped img');
        return;
      }
      dispatch(setCroppedImg(blob));
      router.push('/app/generator', 'forward');
    });
  };

  if (!imgUrl) {
    return <Redirect to='/app' />;
  }

  return (
    <>
      <h4 className={styles.header}>
        Шаг 2<br />
        Редактирование
      </h4>
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
      <span>Обрежьте изображение по кругу</span>
      <div className={styles.btnGroup}>
        <BackButton backUrl='/app' />
        <IonButton type='button' shape='round' onClick={onCrop}>
          Обрезать
        </IonButton>
      </div>
    </>
  );
}

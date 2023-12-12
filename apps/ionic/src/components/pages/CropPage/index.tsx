import { IonButton, IonIcon, useIonRouter } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import { useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { Redirect } from 'react-router';

import { Layout } from '@/components/Layout';
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
        console.log('Unable to create cropped img blob');
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
    <Layout>
      <main className={styles.main}>
        <h1>
          Шаг 2<br />
          Редактирование
        </h1>
        <h2>Обрежьте изображение по кругу</h2>
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
        <div className={styles.btnGroup}>
          <IonButton
            type='button'
            size='large'
            shape='round'
            fill='outline'
            onClick={() => router.goBack()}
          >
            <IonIcon slot='icon-only' size='large' icon={chevronBack} />
          </IonButton>
          <IonButton type='button' size='large' shape='round' onClick={onCrop}>
            Обрезать
          </IonButton>
        </div>
      </main>
    </Layout>
  );
}

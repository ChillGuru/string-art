import { IonButton, useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { Layout } from '@/components/Layout';
import { AuthService } from '@/modules/Auth/service';
import { setImg } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';
import {useRef} from 'react';
import styles from './styles.module.scss';

export function UploadPage() {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const imgForm = useForm<{ image: FileList }>();

  const onSubmit = imgForm.handleSubmit((data) => {
    const imgFile = data.image[0];
    dispatch(setImg(imgFile));
    router.push('/app/crop', 'forward');
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (inputRef.current){
      inputRef.current.click();
    }
  };

  return (
    <Layout>
      <main className={styles.container}>
        <IonButton
        className={styles.exit}
          type='button'
          size='default'
          fill='clear'
          onClick={() =>
            AuthService.logOut(() => router.push('/', 'root', 'replace'))
          }
        >
          &lt;
        </IonButton>
        <form onSubmit={onSubmit}>
          {imgForm.formState.isValid ? 'Можно субмиттить' : 'Нельзя субмиттить'}
          <input
            {...imgForm.register('image', { required: true })}
            type='file'
            accept='image/*'
            ref={inputRef}
            className={styles.input}
            style={{ width: '100%' }}
          />
          <div className={styles.inputUI} onClick={handleClick}> 
            <p>
              Выберите изображение
            </p>
            <svg width="73" height="73" viewBox="0 0 73 73" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M70.4673 53.3716L59.5098 27.7807C55.7989 19.0987 48.9723 18.7486 44.3863 27.0105L37.7698 38.9483C34.409 45.0047 28.1426 45.5298 23.8016 40.1036L23.0315 39.1233C18.5154 33.452 12.144 34.1522 8.88822 40.6287L2.86683 52.7065C-1.36914 61.1084 4.75727 71.0157 14.1394 71.0157H58.8096C67.9117 71.0157 74.0381 61.7385 70.4673 53.3716Z" stroke="#95CEA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.9702 22.0048C24.7705 22.0048 29.4726 17.3027 29.4726 11.5024C29.4726 5.70211 24.7705 1 18.9702 1C13.1699 1 8.46777 5.70211 8.46777 11.5024C8.46777 17.3027 13.1699 22.0048 18.9702 22.0048Z" stroke="#95CEA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p className={styles.galery}> Галерея</p>
          </div>
          <IonButton className={styles.load} size='large' type='submit'>
            Загрузить картинку
          </IonButton>
        </form>
      </main>
    </Layout>
  );
}

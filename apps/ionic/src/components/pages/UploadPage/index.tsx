import { IonButton, useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { Layout } from '@/components/Layout';
import { AuthService } from '@/modules/Auth/service';
import { setImg } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';

export function UploadPage() {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const imgForm = useForm<{ image: FileList }>();

  const onSubmit = imgForm.handleSubmit((data) => {
    const imgFile = data.image[0];
    dispatch(setImg(imgFile));
    router.push('/app/crop', 'forward');
  });

  return (
    <Layout>
      <main>
        <IonButton
          type='button'
          size='large'
          fill='clear'
          onClick={() =>
            AuthService.logOut(() => router.push('/', 'root', 'replace'))
          }
        >
          Выйти
        </IonButton>
        <form onSubmit={onSubmit}>
          {imgForm.formState.isValid ? 'Можно субмиттить' : 'Нельзя субмиттить'}
          <input
            {...imgForm.register('image', { required: true })}
            type='file'
            accept='image/*'
            style={{ width: '100%' }}
          />
          <IonButton size='large' type='submit'>
            Загрузить картинку
          </IonButton>
        </form>
      </main>
    </Layout>
  );
}

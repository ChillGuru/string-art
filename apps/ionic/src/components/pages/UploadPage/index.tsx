import { IonButton, useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { AuthService } from '@/modules/Auth/service';
import { setImgUrl } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';

export function UploadPage() {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const imgForm = useForm<{ image: FileList }>();

  const onSubmit = imgForm.handleSubmit((data) => {
    const imgFile = data.image[0];
    dispatch(setImgUrl(imgFile));
    router.push('/app/generator', 'forward');
  });

  return (
    <div>
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
        <button type='submit'>Загрузить картинку</button>
      </form>
    </div>
  );
}

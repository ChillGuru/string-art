import { IonButton, useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { AuthService } from '@/modules/Auth/service';
import { EncodingService } from '@/modules/Encoding/service';
import { ExportableLayerData } from '@/modules/Generator/models';
import { setImg } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';

export function UploadPage() {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const imgForm = useForm<{ image: FileList }>();

  const onSubmit = imgForm.handleSubmit(async (data) => {
    const imgFile = data.image[0];
    const b64 = await EncodingService.blobToBase64(imgFile);

    let meta: Record<string, ExportableLayerData>;
    try {
      meta = EncodingService.readMetadata<typeof meta>(b64);
      console.log(meta);
    } catch (e) {
      console.error('Reading metadata from image failed:');
      console.error(e);
    }

    dispatch(setImg(imgFile));
    router.push('/app/crop', 'forward');
  });

  return (
    <>
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
    </>
  );
}

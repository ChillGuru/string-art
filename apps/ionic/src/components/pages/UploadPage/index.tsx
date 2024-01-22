import { IonButton, useIonAlert, useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { AuthService } from '@/modules/Auth/service';
import { EncodingService } from '@/modules/Encoding/service';
import {
  AssemblyLayerData,
  ExportableLayerData,
} from '@/modules/Generator/models';
import { setFinishedImg, setImg, setLayers } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';

export function UploadPage() {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const [showAlert] = useIonAlert();

  function showConfirmation(
    imgFile: File,
    metadata: Record<string, ExportableLayerData>
  ) {
    showAlert({
      header: 'Внимание!',
      subHeader: 'В загруженном изображении замечены данные о шагах сборки',
      message: `Хотите перейти сразу к плетению?`,
      buttons: [
        {
          text: 'Да',
          role: 'confirm',
          handler() {
            const layers: Record<string, AssemblyLayerData> = {};
            for (const [key, val] of Object.entries(metadata)) {
              layers[key] = {
                ...val,
                currentStep: 0,
                layerImgData: new Uint8Array([]),
              };
            }
            dispatch(setLayers(layers));
            dispatch(setFinishedImg(imgFile));
            router.push('/app/assembly', 'forward');
          },
        },
        {
          text: 'Нет',
          role: 'cancel',
          handler() {
            dispatch(setImg(imgFile));
            router.push('/app/crop', 'forward');
          },
        },
      ],
    });
  }

  const imgForm = useForm<{ image: FileList }>();

  const onSubmit = imgForm.handleSubmit(async (data) => {
    const imgFile = data.image[0];
    const b64 = await EncodingService.blobToBase64(imgFile);

    let meta: Record<string, ExportableLayerData>;
    try {
      meta = EncodingService.readMetadata<typeof meta>(b64);
      console.log({ meta });

      showConfirmation(imgFile, meta);
    } catch (e) {
      console.error('Reading metadata from image failed:');
      console.error(e);

      dispatch(setImg(imgFile));
      router.push('/app/crop', 'forward');
    }
  });

  return (
    <>
      <IonButton
        type='button'
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
        <IonButton type='submit'>Загрузить картинку</IonButton>
      </form>
    </>
  );
}

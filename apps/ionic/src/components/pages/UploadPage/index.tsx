import { IonButton, IonIcon, useIonAlert, useIonRouter } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import { useForm } from 'react-hook-form';

import selectIcon from '@/images/imgSelectIcon.png';
import { AuthService } from '@/modules/Auth/service';
import { EncodingService } from '@/modules/Encoding/service';
import {
  AssemblyLayerData,
  ExportableLayerData,
} from '@/modules/Generator/models';
import { setFinishedImg, setImg, setLayers } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';

import styles from './styles.module.scss';

export function UploadPage() {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const [showAlert] = useIonAlert();

  function showConfirmation(
    imgFile: File,
    metadata: Record<string, ExportableLayerData>
  ) {
    showAlert({
      header: 'Импорт шагов',
      subHeader: 'В загруженном изображении есть данные о шагах плетения',
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
      <h4 className={styles.header}>
        Шаг 1 <br />
        Загрузка изображения
      </h4>
      <form
        onSubmit={onSubmit}
        className={styles.form}
        onChange={() => {
          onSubmit();
        }}
      >
        <label htmlFor='imgInput' className={styles.imageSelectArea}>
          <span className={styles.formHeader}>Выберите изображение</span>
          <img
            src={
              'https://cdn.discordapp.com/attachments/440794085352275988/1199323392038404176/imgSelectIcon.png'
            }
            className={styles.imgSelectLogo}
            alt='imgSelectLogo'
          />
          <input
            {...imgForm.register('image', { required: true })}
            type='file'
            id='imgInput'
            accept='image/*'
            className={styles.imgInput}
            multiple
          />
          <IonButton shape='round' disabled style={{ opacity: '1' }}>
            Галерея
          </IonButton>
        </label>
      </form>
      <div className={styles.btnGroup}>
        <IonButton
          type='button'
          shape='round'
          fill='outline'
          onClick={() =>
            AuthService.logOut(() => router.push('/', 'root', 'replace'))
          }
        >
          <IonIcon slot='icon-only' icon={chevronBack} />
        </IonButton>
      </div>
    </>
  );
}

import { IonButton, useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';

import { Layout } from '@/components/Layout';
import { AuthService } from '@/modules/Auth/service';
import { setImg } from '@/modules/Generator/slice';
import { useAppDispatch } from '@/redux/hooks';

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

  return (
    <Layout>
      <main className={styles.container}>
        <div className={styles.header}>
          ШАГ 1 <br/>
          ЗАГРУЗКА ИЗОБРАЖЕНИЯ
        </div>
        <form onChange={onSubmit} className={styles.form}>
          <label htmlFor="imgInput" className={styles.imageSelectArea}>
            <span className={styles.formHeader}>
              Выберите изображение
            </span>
            <img src="public/imgSelectIcon.png"
              className={styles.imgSelectLogo}
              alt="imgSelectLogo" />
            <input
              {...imgForm.register('image', { required: true })}
              type='file'
              id='imgInput'
              accept='image/*'
              className={styles.imgInput}
              multiple
          />
            <div className={styles.galeryBtn}>Галерея</div>
          </label>
        </form>
        <div className={styles.navButtons}>
          <IonButton
            type='button'
            fill='clear'
            className={styles.backBtn}
            onClick={() =>
            AuthService.logOut(() => router.push('/', 'root', 'replace'))
          }
         >
            {"<"}
          </IonButton>
        </div>
      </main>
    </Layout>
  );
}

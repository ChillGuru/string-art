import { IonButton, IonIcon, useIonRouter } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';

type Props = {
  backUrl: string;
};

export function BackButton(props: Props) {
  const router = useIonRouter();
  return (
    <IonButton
      type='button'
      size='large'
      shape='round'
      fill='outline'
      onClick={() => {
        if (props.backUrl) {
          router.push(props.backUrl, 'back', 'replace');
          return;
        }
        router.goBack();
      }}
    >
      <IonIcon slot='icon-only' size='large' icon={chevronBack} />
    </IonButton>
  );
}

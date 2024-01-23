import { IonButton, IonIcon, useIonRouter } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';

type Props = {
  backUrl?: string;
};

export function BackButton({ backUrl }: Props) {
  const router = useIonRouter();
  return (
    <IonButton
      type='button'
      shape='round'
      fill='outline'
      onClick={() => {
        router.goBack();
        return;
        // if (backUrl) {
        //   router.push(backUrl, 'back', 'replace', { unmount: true });
        //   return;
        // }
      }}
    >
      <IonIcon slot='icon-only' icon={chevronBack} />
    </IonButton>
  );
}

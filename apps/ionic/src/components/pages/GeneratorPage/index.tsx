import { Redirect } from 'react-router';

import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

export function GeneratorPage() {
  const croppedImgUrl = useAppSelector(
    (s: RootState) => s.generator.croppedImgUrl
  );

  if (!croppedImgUrl) {
    return <Redirect to='/app/crop' />;
  }

  return (
    <div>
      <h1>Начинаем плетение</h1>
    </div>
  );
}

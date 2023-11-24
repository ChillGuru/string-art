import { useOpenCv } from 'opencv-react-ts';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

export function UserPage() {
  const { loaded, cv } = useOpenCv();

  const canvas = useRef<HTMLCanvasElement>(null);

  const imgForm = useForm<{ image: FileList }>();

  const onSubmit = imgForm.handleSubmit((data) => {
    const imgFile = data.image[0];
    console.log(imgFile);
    if (!canvas.current) return;
    const ctx = canvas.current.getContext('2d')!;
    const img = new Image();
    const imgFileUrl = URL.createObjectURL(imgFile);
    img.onload = () => {
      console.log('Image loaded!');
      const IMG_SIZE = 600;
      ctx.canvas.width = IMG_SIZE;
      ctx.canvas.height = IMG_SIZE;
      ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, IMG_SIZE, IMG_SIZE);
      URL.revokeObjectURL(imgFileUrl);
    };
    img.src = imgFileUrl;
  });

  // useEffect(() => {}, [cv]);

  return (
    <div>
      {loaded ? 'loaded yea' : 'loading'}
      <form onSubmit={onSubmit}>
        <input
          {...imgForm.register('image')}
          type='file'
          accept='image/*'
          style={{ width: '100%' }}
        />
        <button type='submit'>Загрузить картинку</button>
      </form>
      <canvas ref={canvas} />
    </div>
  );
}

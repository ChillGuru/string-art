import { useOpenCv } from 'opencv-react-ts';

export type OpenCV = NonNullable<ReturnType<typeof useOpenCv>['cv']>;

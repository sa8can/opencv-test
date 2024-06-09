import cv, { Mat } from 'opencv-ts';

export type Updatable = (currFrame: Mat) => Mat;

export const onRuntimeInitialized = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  process: Updatable,
) => {
  const cap = new cv.VideoCapture(video);
  const frame = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);

  requestAnimationFrame(() => update(canvas, process, cap, frame));
};

//opencv-tsでopencv.VideoCapture型がうまく定義されてない？ようなので一旦capはanyにしときます
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const update = (canvas: HTMLCanvasElement, process: Updatable, cap: any, currFrame: Mat) => {
  cap.read(currFrame);
  const final = process(currFrame);
  cv.imshow(canvas, final);

  requestAnimationFrame(() => update(canvas, process, cap, currFrame));
};

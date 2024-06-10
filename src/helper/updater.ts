/* eslint-disable @typescript-eslint/no-explicit-any */
import cv, { Mat } from 'opencv-ts';

export type Updatable = (currFrame: Mat) => Mat;

export default class Updater {
  private isUpdate: boolean = true;

  private readonly canvas: HTMLCanvasElement;
  private readonly process: Updatable;
  private readonly currFrame: Mat;

  //opencv-tsでopencv.VideoCapture型がうまく定義されてない？ようなので一旦capはanyにしときます
  private readonly videoCapture: any;

  constructor(_video: HTMLVideoElement, _canvas: HTMLCanvasElement, _process: Updatable) {
    this.canvas = _canvas;
    this.process = _process;
    this.videoCapture = new cv.VideoCapture(_video);
    this.currFrame = new cv.Mat(_canvas.height, _canvas.width, cv.CV_8UC4);

  }

  public startUpdateFrame() {
    this.isUpdate = true;
    requestAnimationFrame(() => this.updateFrame());
  }

  public stopUpdateFrame() {
    this.isUpdate = false;
  }

  private updateFrame() {
    if (!this.isUpdate) return;

    this.videoCapture.read(this.currFrame);
    const final = this.process(this.currFrame);
    cv.imshow(this.canvas, final);

    requestAnimationFrame(() => this.updateFrame());
  }
}

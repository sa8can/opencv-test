import cv from 'opencv-ts';
import { getWebCamStream } from './webcam-helper';
import { onRuntimeInitialized, Updatable } from './frame-updater';

/**
 * webcamの画像をopencvで処理してcanvasに表示するのを簡略化するヘルパークラスです
 * @param onInitialized -OpenCVの初期化が終わった時に呼び出されるコールバック関数
 * @param process -毎フレーム呼び出されるコールバック関数
 */
export default class OpenCVWebCamHelper {
  public readonly video: HTMLVideoElement;
  public readonly canvas: HTMLCanvasElement;

  private stream: MediaStream | undefined;
  private isInCamera: boolean = false;

  private readonly process: Updatable;
  private readonly onInitialized: CallableFunction;

  public get width() {
    return this.video.width;
  }
  public get height() {
    return this.video.height;
  }

  constructor(onInitialized: CallableFunction, process: Updatable) {
    this.video = document.getElementById('app-video')! as HTMLVideoElement;
    this.canvas = document.getElementById('app-canvas')! as HTMLCanvasElement;

    this.onInitialized = onInitialized;
    this.process = process;

    document.addEventListener('click', () => {
      this.isInCamera = !this.isInCamera;
      this.init();
    });

    this.init();
  }

  private init() {
    this.setSize(window.innerWidth, window.innerHeight);

    if (this.stream !== undefined) {
      this.stream.getVideoTracks().forEach((camera) => {
        camera.stop();
      });
    }

    getWebCamStream(this.isInCamera)
      .then((stream) => {
        this.stream = stream;
        this.video.srcObject = stream;
        this.video.play();
      })
      .catch((e) => {
        console.error(e);
        return;
      });

    cv['onRuntimeInitialized'] = () => {
      this.onInitialized();
      onRuntimeInitialized(this.video, this.canvas, this.process);
    };
  }

  private setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.video.width = width;
    this.video.height = height;
  }
}

import cv from 'opencv-ts';
import { getWebCamStream } from './webcam-helper';
import Updater, { Updatable } from './updater';

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

  private updater: Updater | undefined;

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

    cv['onRuntimeInitialized'] = () => {
      this.onInitialized();
      this.updater = new Updater(this.video, this.canvas, this.process);
    };

    this.addEventListeners();
    this.init();
  }

  private addEventListeners() {
    window.addEventListener('resize', () => {
      window.location.reload();
    });

    //Change camera
    document.addEventListener('click', () => {
      this.isInCamera = !this.isInCamera;
      this.init();
    });
  }

  private init() {
    this.setSize(window.innerWidth, window.innerHeight);

    this.stopStreamAndUpdate();

    getWebCamStream(this.isInCamera)
      .then((stream) => {
        this.stream = stream;
        this.video.srcObject = stream;
        this.video.play();

        this.onInitialized();
        this.updater?.startUpdateFrame();
      })
      .catch((e) => {
        console.error(e);
        return;
      });
  }

  private stopStreamAndUpdate() {
    this.updater?.stopUpdateFrame();

    this.stream?.getVideoTracks().forEach((videoStream) => {
      videoStream.stop();
      this.video.srcObject = null;
    });
  }

  private setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.video.width = width;
    this.video.height = height;
  }
}

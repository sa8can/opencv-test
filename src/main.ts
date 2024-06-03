import cv from 'opencv-ts';

document.addEventListener('DOMContentLoaded', () => new OpenCVTest());

class OpenCVTest {
  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;

  constructor() {
    this.video = document.getElementById('app-video')! as HTMLVideoElement;
    this.canvas = document.getElementById('app-canvas')! as HTMLCanvasElement;

    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.video.height = this.canvas.height;
    this.video.width = this.canvas.width;

    const a = navigator.mediaDevices.enumerateDevices();
    a.then((data) => {
      console.log(data);
    });
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { exact: 'environment' },
        },
        audio: false,
      })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.play();
      })
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            this.video.srcObject = stream;
            this.video.play();
          })
          .catch((err2) => {
            console.log('An error occurred! ' + err2);
          });
      });

    cv.onRuntimeInitialized = () => this.onLoaded();
  }

  private onLoaded() {
    let src = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    let dst = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC1);
    let cap = new cv.VideoCapture(this.video);

    let frame1 = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    cap.read(frame1);

    let frame2 = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    cap.read(frame2);

    let final = new cv.Mat(
      this.video.height,
      this.video.width,
      cv.CV_8UC4,
      new cv.Scalar(255, 255, 255, 255),
    );

    const diff = new cv.Mat();
    const gray = new cv.Mat();
    const blur = new cv.Mat();
    const thresh = new cv.Mat();
    const dilated = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    const add = 30;

    requestAnimationFrame(() => process());

    const processVideo = () => {
      cap.read(src);

      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
      cv.imshow(this.canvas, dst);

      requestAnimationFrame(() => processVideo());
    };
    const process = () => {
      cap.read(frame2);

      cv.absdiff(frame1, frame2, diff);
      cv.cvtColor(diff, gray, cv.COLOR_BGR2GRAY);
      cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
      cv.threshold(blur, thresh, 40, 255, cv.THRESH_BINARY);
      cv.dilate(thresh, dilated, new cv.Mat.ones(3, 3, cv.CV_8U), new cv.Point(-1, -1), 3);
      cv.findContours(dilated, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

      for (let i = 0; i < contours.size(); ++i) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area > 1000) {
          const rect = cv.boundingRect(contour);
          rect.x -= add;
          rect.y -= add;
          rect.width += add * 2;
          rect.height += add * 2;

          rect.x = Math.max(0, rect.x);
          rect.y = Math.max(0, rect.y);

          if (rect.x + rect.width >= this.canvas.width) rect.width = this.canvas.width - rect.x;
          if (rect.y + rect.height >= this.canvas.height) rect.height = this.canvas.height - rect.y;

          const roi = frame2.roi(new cv.Rect(rect.x, rect.y, rect.width, rect.height));
          roi.copyTo(final.roi(new cv.Rect(rect.x, rect.y, rect.width, rect.height)));

          const color = new cv.Scalar(255, 255, 255, 255);
          cv.rectangle(
            final,
            new cv.Point(rect.x, rect.y),
            new cv.Point(rect.x + rect.width, rect.y + rect.height),
            color,
            0.1,
          );

          cv.putText(
            final,
            `x:${rect.x} y:${rect.y}`,
            new cv.Point(rect.x + 5, rect.y + 10),
            cv.FONT_HERSHEY_PLAIN,
            0.5,
            color,
            1,
            cv.LINE_AA,
          );
        }
      }

      cv.imshow(this.canvas, final);

      frame1.delete();

      frame1 = frame2.clone();

      requestAnimationFrame(() => process());
    };
  }
}

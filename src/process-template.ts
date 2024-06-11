import cv, { Mat } from 'opencv-ts';
import OpenCVWebCamHelper from './helper/opencv-with-webcam';

export default class OpenCVProcess {
  private manager: OpenCVWebCamHelper;

  constructor() {
    this.manager = new OpenCVWebCamHelper(
      () => this.init(),
      (Mat) => this.process(Mat),
    );
  }

  // Call on opencv-ts runtime initialized
  public init() {}

  // Call every frame
  public process(currFrame: Mat): Mat {
    const gray = new cv.Mat();
    cv.cvtColor(currFrame, gray, cv.COLOR_BGR2GRAY);
    
    return gray;
  }
}

import { Mat } from 'opencv-ts';
import OpenCVWebCamHelper from './helper/opencv-with-webcam';

export default class OpenCVProcess {
  private readonly manager: OpenCVWebCamHelper;

  constructor() {
    this.manager = new OpenCVWebCamHelper(
      () => this.init(),
      (Mat) => this.process(Mat),
    );
  }

  public init() {}

  public process(currFrame: Mat): Mat {
    return currFrame;
  }
}

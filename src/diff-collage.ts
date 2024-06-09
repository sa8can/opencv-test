import cv, { Mat, MatVector } from 'opencv-ts';
import OpenCVWebCamHelper from './helper/opencv-with-webcam';
import * as RectUtil from './util/rect-util';

export default class DiffCollage {
  private readonly manager: OpenCVWebCamHelper;

  private RECT_EXPAND = 30;
  private CONTOUR_AREA_THRESHOLD = 1000;

  private COLOR = new cv.Scalar(255, 255, 255, 255);

  private frame1!: Mat;
  private frame2!: Mat;
  private final!: Mat;

  private diff!: Mat;
  private gray!: Mat;
  private blur!: Mat;
  private thresh!: Mat;
  private dilated!: Mat;
  private contours!: MatVector;
  private hierarchy!: Mat;

  constructor() {
    this.manager = new OpenCVWebCamHelper(
      () => this.init(),
      (Mat) => this.process(Mat),
    );
  }

  private init() {
    this.frame1 = new cv.Mat(this.manager.height, this.manager.width, cv.CV_8UC4);
    this.frame2 = new cv.Mat(this.manager.height, this.manager.width, cv.CV_8UC4);
    this.final = new cv.Mat(
      this.manager.height,
      this.manager.width,
      cv.CV_8UC4,
      new cv.Scalar(255, 255, 255, 255),
    );

    this.diff = new cv.Mat();
    this.gray = new cv.Mat();
    this.blur = new cv.Mat();
    this.thresh = new cv.Mat();
    this.dilated = new cv.Mat();
    this.contours = new cv.MatVector();
    this.hierarchy = new cv.Mat();
  }

  private process(currFrame: Mat): Mat {
    this.frame2 = currFrame;
    this.frame1 ??= currFrame;

    this.processImage();
    this.processContours();

    this.frame1.delete();
    this.frame1 = this.frame2.clone();

    return this.final;
  }

  private processImage() {
    cv.absdiff(this.frame1, this.frame2, this.diff);
    cv.cvtColor(this.diff, this.gray, cv.COLOR_BGR2GRAY);
    cv.GaussianBlur(this.gray, this.blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.threshold(this.blur, this.thresh, 40, 255, cv.THRESH_BINARY);
    cv.dilate(this.thresh, this.dilated, new cv.Mat.ones(3, 3, cv.CV_8U), new cv.Point(-1, -1), 3);
    cv.findContours(
      this.dilated,
      this.contours,
      this.hierarchy,
      cv.RETR_TREE,
      cv.CHAIN_APPROX_SIMPLE,
    );
  }

  private processContours() {
    for (let i = 0; i < this.contours.size(); ++i) {
      const contour = this.contours.get(i);
      const area = cv.contourArea(contour);

      if (area < this.CONTOUR_AREA_THRESHOLD) continue;
      
      const contourRect = cv.boundingRect(contour);

      RectUtil.expandRect(contourRect, this.RECT_EXPAND, this.RECT_EXPAND);
      RectUtil.clampRect(contourRect, 0, 0, this.manager.width, this.manager.height);

      const roi = this.frame2.roi(contourRect);
      roi.copyTo(this.final.roi(contourRect));

      RectUtil.drawRectangleWithRect(this.final, contourRect, this.COLOR, 1);

      cv.putText(
        this.final,
        `x:${contourRect.x} y:${contourRect.y}`,
        new cv.Point(contourRect.x + 5, contourRect.y + 10),
        cv.FONT_HERSHEY_PLAIN,
        0.5,
        this.COLOR,
        1,
        cv.LINE_AA,
      );
    }
  }
}

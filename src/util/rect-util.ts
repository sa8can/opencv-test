import cv, { Mat, Rect, Scalar } from 'opencv-ts';

export const expandRect = (rect: Rect, width: number, height: number): Rect => {
  const newRect = new cv.Rect(rect.x, rect.y, rect.width, rect.height);

  newRect.x -= width;
  newRect.y -= height;
  newRect.width += width * 2;
  newRect.height += height * 2;

  return newRect;
};

export const clampRect = (rect: Rect, minX: number, minY: number, maxX: number, maxY: number): Rect => {
  const newRect = new cv.Rect(rect.x, rect.y, rect.width, rect.height);

  newRect.x = Math.max(minX, rect.x);
  newRect.y = Math.max(minY, rect.y);

  if (rect.x + rect.width >= maxX) newRect.width = maxX - rect.x;
  if (rect.y + rect.height >= maxY) newRect.height = maxY - rect.y;

  return newRect;
};

export const drawRectangleWithRect = (mat: Mat, rect: Rect, color: Scalar, thickness: number) => {
  cv.rectangle(
    mat,
    new cv.Point(rect.x, rect.y),
    new cv.Point(rect.x + rect.width, rect.y + rect.height),
    color,
    thickness,
  );
};

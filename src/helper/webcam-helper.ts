const errorMessage = 'No webcam available';
const constraints = Object.freeze({
  video: { facingMode: {}, width: 0, height: 0 },
  audio: false,
});

export const getWebCamStream = async (isInCamera: boolean): Promise<MediaStream> => {
  if (!(await isAvailableWebCam())) throw Error(errorMessage);

  const newConstraints = structuredClone(constraints);
  const size = getVideoSize();

  newConstraints.video.width = size.width;
  newConstraints.video.height = size.height;
  newConstraints.video.facingMode = isInCamera ? 'user' : 'environment';

  return navigator.mediaDevices.getUserMedia(newConstraints);
};

const isAvailableWebCam = async (): Promise<boolean> => {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      const videoInputs = devices.filter((device) => device.kind === 'videoinput');
      return videoInputs.length >= 1;
    })
    .catch(() => {
      return false;
    });
};

const getVideoSize = (): { width: number; height: number } => {
  const orientation = (screen.orientation || {}).type;
  const size = { width: 0, height: 0 };

  if (orientation === 'portrait-primary' || orientation === 'portrait-secondary') {
    size.width = window.innerHeight;
    size.height = window.innerWidth;
  }

  if (orientation === 'landscape-primary' || orientation === 'landscape-secondary') {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
  }

  return size;
};

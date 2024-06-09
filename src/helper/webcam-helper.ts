const errorMessage = 'No webcam available';
const constraints = {
  video: { facingMode: {}, width: window.innerWidth, height: window.innerHeight },
  audio: false,
};

export type FacingModes = 'environment' | 'user';

export const getWebCamStream = async (isInCamera: boolean): Promise<MediaStream> => {
  if (!(await isAvailableWebCam())) throw Error(errorMessage);

  constraints.video.facingMode = isInCamera ? 'user' : { exact: 'environment' };

  return navigator.mediaDevices.getUserMedia(constraints);
};

const isAvailableWebCam = async (): Promise<boolean> => {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      console.log(devices);
      const videoInputs = devices.filter((device) => device.kind === 'videoinput');

      if (videoInputs.length === 0) return false;
      return true;
    })
    .catch(() => {
      return false;
    });
};

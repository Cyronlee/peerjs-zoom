export const getUserMedia =
  typeof navigator === "undefined"
    ? null
    : navigator?.getUserMedia ||
      navigator?.webkitGetUserMedia ||
      navigator?.mozGetUserMedia;

export const showVideo = (
  stream: MediaStream,
  video: HTMLVideoElement,
  muted: boolean,
) => {
  video.srcObject = stream;
  video.volume = muted ? 0 : 1;
  video.onloadedmetadata = () => video.play();
};

export const resolutions: Record<
  string,
  { videoBitrate: string; width: number; height: number }
> = {
  "144p": {
    videoBitrate: "200k",
    width: 256,
    height: 144,
  },
  "360p": {
    videoBitrate: "800k",
    width: 640,
    height: 360,
  },
  "720p": {
    videoBitrate: "2500k",
    width: 1280,
    height: 720,
  },
};

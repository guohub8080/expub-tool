import { animateHeight } from '@smil/animate/height';
import type { extrudeOptions } from './genWidthAnimate';

export const genRectAnimate = (widthTotalDuration: number, options: extrudeOptions): React.ReactElement => {
  return animateHeight({
    initValue: options.initHeight,
    timeline: [
      { to: 0, durationSeconds: 0.001 },
      { to: 0, durationSeconds: widthTotalDuration - 0.001 },
    ],
    begin: options.begin,
    isFreeze: true,
  });
};

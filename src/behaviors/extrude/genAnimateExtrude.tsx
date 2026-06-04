import { defaultTo, isNil } from 'lodash';
import { buildTimeline } from '@smil/timeline/compile';
import type { I_TimelineKeyframe } from '@smil/timeline/types';
import { getEaseBezier } from "@smil/bezier/getEaseBezier";
import { animateHeight } from '@smil/animate/height';
import type { extrudeOptions } from './genWidthAnimate';

export const genAnimateExtrude = (options: extrudeOptions): {
  widthAnimate: React.ReactElement;
  rectAnimate: React.ReactElement;
} => {
  const widthTimeline: I_TimelineKeyframe<string>[] = options.timeline.map((segment) => ({
    keySplines: defaultTo(segment.keySplines, getEaseBezier({ isOut: true })),
    to: `${100 * (segment.toHeight / options.initHeight)}%`,
    durationSeconds: segment.durationSeconds,
  }));

  const widthParams = buildTimeline({
    initValue: `100%`,
    timeline: widthTimeline,
  });

  const loopCount = defaultTo(options.loopCount, 1);
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount;

  const hasKeySplines = options.timeline.some(seg => !isNil(seg.keySplines));
  const finalCalcMode = defaultTo(options.calcMode, hasKeySplines ? 'spline' : 'linear');
  const isFreeze = defaultTo(options.isFreeze, true);

  const widthAnimate = (
    <animate
      attributeName="width"
      values={widthParams.values}
      keyTimes={widthParams.keyTimes}
      keySplines={finalCalcMode === 'spline' ? widthParams.keySplines : void 0}
      dur={`${widthParams.totalDuration}s`}
      begin={options.begin}
      calcMode={finalCalcMode}
      fill={isFreeze ? 'freeze' : 'remove'}
      repeatCount={repeatCountValue}
      restart="never"
    />
  );

  const rectAnimate = animateHeight({
    initValue: options.initHeight,
    timeline: [
      { to: 0, durationSeconds: 0.001 },
      { to: 0, durationSeconds: widthParams.totalDuration - 0.001 },
    ],
    begin: options.begin,
    isFreeze: true,
  });

  return { widthAnimate, rectAnimate };
};

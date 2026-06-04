import { isNil, defaultTo, isEmpty } from 'lodash';
import { buildTimeline } from '@smil/timeline/compile';
import type { I_TimelineKeyframe } from '@smil/timeline/types';
import { getEaseBezier } from "@smil/bezier/getEaseBezier";
import type { CSSProperties } from "react";

export type extrudeOptions = {
  canvasWidth: number;
  initHeight: number;
  timeline: {
    toHeight: number;
    durationSeconds: number;
    keySplines?: string;
  }[];
  begin?: string;
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced';
  isFreeze?: boolean;
  loopCount?: number;
  svgStyle?: CSSProperties;
};

export const genWidthAnimate = (options: extrudeOptions): React.ReactElement => {
  if (isNil(options.canvasWidth)) {
    throw new Error('canvasWidth 是必填参数');
  }
  if (isNil(options.initHeight)) {
    throw new Error('initHeight 是必填参数');
  }
  if (isEmpty(options.timeline) || !Array.isArray(options.timeline)) {
    throw new Error('timeline 必须是非空数组');
  }

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

  return (
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
};

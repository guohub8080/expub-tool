/**
 * genAnimateExtrude - 挤出动画生成器
 * 基于挤出动画原理：通过撑开容器实现"露出"效果
 *
 * 核心设计：
 * 1. 外层 SVG pointerEvents: none - 不阻挡下方内容的点击
 * 2. 内部 rect pointerEvents: painted - 负责接收点击事件
 * 3. rect 点击后高度变为 0 - 实现点击后消失，不再阻挡后续交互
 *
 * 瞬间撤离机制：
 * - rect 的 height 动画使用两段 timeline：
 *   第一段 0.001s 跳到 0，第二段保持 0 直到 width 动画结束
 * - dur 使用与 width 动画相同的总时长，避免因时间太短被系统忽略
 *
 * 工具函数导出：
 * - genWidthAnimate: 仅生成宽度 <animate> 元素
 * - genRectAnimate: 仅生成矩形高度 <animate> 元素
 * - genAnimateExtrudeAttrs: 生成宽度+矩形高度 <animate> 元素组合
 */

import React from 'react';
import { isDefined } from '@utils/fn/isDefined'
import {isNil, defaultTo, isEmpty} from 'lodash';
import {buildTimeline} from '@smil/timeline/compile';
import type {I_TimelineKeyframe} from '@smil/timeline/types';
import {getEaseBezier} from "@smil/bezier/getEaseBezier";
import {animateHeight} from "@smil/animate/height";
import SvgEx from "@html/basicEx/SvgEx";

export { genWidthAnimate, type extrudeOptions as extrudeOptionsAttrs } from './genWidthAnimate';
export { genRectAnimate } from './genRectAnimate';
export { genAnimateExtrude as genAnimateExtrudeAttrs } from './genAnimateExtrude';

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
};

export const genAnimateExtrude = (props: extrudeOptions): React.ReactElement => {
  if (isNil(props.canvasWidth)) {
    throw new Error('canvasWidth is required');
  }
  if (isNil(props.initHeight)) {
    throw new Error('initHeight is required');
  }
  if (isEmpty(props.timeline) || !Array.isArray(props.timeline)) {
    throw new Error('timeline must be a non-empty array');
  }

  const widthTimeline: I_TimelineKeyframe<string>[] = props.timeline.map((segment) => ({
    keySplines: defaultTo(segment.keySplines, getEaseBezier({isOut: true})),
    toAbs: `${100 * (segment.toHeight / props.initHeight)}%`,
    durationSeconds: segment.durationSeconds,
  }));

  const widthParams = buildTimeline({
    initValue: `100%`,
    timeline: widthTimeline,
  });

  const loopCount = defaultTo(props.loopCount, 1);
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount;

  const hasKeySplines = props.timeline.some(seg => isDefined(seg.keySplines));
  const finalCalcMode = defaultTo(props.calcMode, hasKeySplines ? 'spline' : 'linear');
  const isFreeze = defaultTo(props.isFreeze, true);

  return (
    <SvgEx
      data-label="extrude-animate-controler"
      viewBox={`0 0 ${props.canvasWidth} ${props.initHeight}`}
      style={{ pointerEvents: 'none', display: 'block' }}
      important={[['max-width', 'none']]}>
      <animate
        attributeName="width"
        values={widthParams.values}
        keyTimes={widthParams.keyTimes}
        keySplines={finalCalcMode === 'spline' ? widthParams.keySplines : void 0}
        dur={`${widthParams.totalDuration}s`}
        begin={props.begin}
        calcMode={finalCalcMode}
        fill={isFreeze ? 'freeze' : 'remove'}
        repeatCount={repeatCountValue}
        restart="never"
      />

      <rect
        data-label="click-trigger"
        width="100%"
        height="100%"
        style={{ pointerEvents: 'painted', opacity: 0 }}>
        {animateHeight({
          initValue: props.initHeight,
          timeline: [
            { toAbs: 0, durationSeconds: 0.001 },
            { toAbs: 0, durationSeconds: widthParams.totalDuration - 0.001 },
          ],
          begin: props.begin,
          isFreeze: true,
        })}
      </rect>
    </SvgEx>
  );
};

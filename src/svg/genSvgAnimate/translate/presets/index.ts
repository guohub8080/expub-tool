/**
 * 平移动画预设 - 统一导出
 */

import { movePresets } from './move';
import { loopPresets } from './loop';
import { pathPresets } from './path';
import { effectPresets } from './effect';

/**
 * 预设的平移动画效果
 */
export const translatePresets = {
  ...movePresets,
  ...loopPresets,
  ...pathPresets,
  ...effectPresets,
};

// 按类别导出（可选）
export { movePresets, loopPresets, pathPresets, effectPresets };

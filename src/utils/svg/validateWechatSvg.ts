import isNil from 'lodash/isNil'

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: IssueSeverity;
  rule: string;
  message: string;
  detail?: string;
  tagName?: string;
  attributeName?: string;
  codeSnippet?: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

// 微信SVG动画属性白名单
const ANIMATE_WHITELIST = new Set([
  'x', 'y', 'width', 'height', 'opacity', 'd', 'points',
  'stroke-width', 'stroke-linecap', 'stroke-dashoffset', 'fill',
]);

const SET_WHITELIST = new Set(['visibility']);

const ANIMATE_TRANSFORM_WHITELIST = new Set([
  'translate', 'scale', 'rotate', 'skewX', 'skewY',
]);

const EVENT_HANDLER_PATTERN = /^on[a-z]+/i;

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeNode(node: Element): string {
  const serializer = new XMLSerializer();
  try {
    const clone = node.cloneNode(true) as Element;
    return escapeHTML(serializer.serializeToString(clone).slice(0, 300));
  } catch {
    return escapeHTML(node.outerHTML?.slice(0, 300) || '[无法序列化节点]');
  }
}

/**
 * 验证SVG代码是否符合微信公众号规范
 */
export function validateWechatSvg(svgCode: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 规则7: 代码体积检查
  if (svgCode.length > 20 * 1024 * 1024) {
    issues.push({
      severity: 'error',
      rule: '代码体积限制',
      message: 'SVG代码体积超过20MB限制',
      detail: `当前代码大小: ${(svgCode.length / 1024 / 1024).toFixed(2)}MB，微信限制最大20MB`,
      suggestion: '请优化SVG代码，移除不必要的元素和属性，压缩路径数据',
    });
    return {
      valid: false,
      issues,
      errorCount: issues.filter(i => i.severity === 'error').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
      infoCount: issues.filter(i => i.severity === 'info').length,
    };
  }

  // 使用DOMParser解析SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');

  // 检查解析错误
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    issues.push({
      severity: 'error',
      rule: 'SVG解析',
      message: 'SVG代码格式不正确，解析失败',
      detail: parseError.textContent || 'XML解析错误',
      suggestion: '请检查SVG标签是否正确闭合，属性值是否使用引号包裹',
    });
    return {
      valid: false,
      issues,
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
    };
  }

  const rootSVG = doc.querySelector('svg');
  if (isNil(rootSVG)) {
    issues.push({
      severity: 'error',
      rule: 'SVG根元素',
      message: '未找到<svg>根元素',
      suggestion: '确保代码以<svg>标签开头',
    });
    return {
      valid: false,
      issues,
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
    };
  }

  // 规则6: 命名空间检查
  const hasXmlns = rootSVG.hasAttribute('xmlns') &&
    rootSVG.getAttribute('xmlns') === 'http://www.w3.org/2000/svg';
  if (!hasXmlns) {
    issues.push({
      severity: 'warning',
      rule: '命名空间声明',
      message: '缺少xmlns命名空间声明或值不正确',
      detail: '根<svg>元素应包含 xmlns="http://www.w3.org/2000/svg"',
      suggestion: '在<svg>标签上添加 xmlns="http://www.w3.org/2000/svg"',
      tagName: 'svg',
      attributeName: 'xmlns',
      codeSnippet: '<svg ' + (rootSVG.hasAttribute('xmlns') ? `xmlns="${rootSVG.getAttribute('xmlns')}"` : '[缺失]') + '>',
    });
  }

  // 递归遍历所有节点
  function traverseNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();

    // 规则2: JavaScript禁用检查 - script标签
    if (tagName === 'script') {
      issues.push({
        severity: 'error',
        rule: 'JavaScript禁用',
        message: '发现<script>标签，微信会过滤所有脚本',
        tagName: 'script',
        codeSnippet: serializeNode(el),
        suggestion: '移除<script>标签，使用SMIL动画(<animate>, <animateTransform>等)代替',
      });
    }

    // 规则5: 嵌套标签限制 - svg嵌套
    if (tagName === 'svg' && el !== rootSVG) {
      issues.push({
        severity: 'error',
        rule: '嵌套标签限制',
        message: 'SVG内不允许嵌套<svg>标签',
        tagName: 'svg',
        codeSnippet: serializeNode(el),
        suggestion: '将所有内容放在一个<svg>根元素内，使用<g>标签分组',
      });
    }

    // 规则5: image标签
    if (tagName === 'image') {
      issues.push({
        severity: 'error',
        rule: '嵌套标签限制',
        message: '发现<image>标签，微信不支持SVG内嵌图片',
        tagName: 'image',
        codeSnippet: serializeNode(el),
        suggestion: '将图片转换为Base64编码的data URI，或改用<rect>配合<pattern>填充',
      });
    }

    // 规则5: style标签
    if (tagName === 'style') {
      issues.push({
        severity: 'error',
        rule: '嵌套标签限制',
        message: '发现<style>标签，微信会过滤SVG内的CSS样式',
        tagName: 'style',
        codeSnippet: serializeNode(el),
        suggestion: '使用行内style属性或SMIL动画属性替代',
      });
    }

    // 规则5: a标签
    if (tagName === 'a') {
      issues.push({
        severity: 'error',
        rule: '嵌套标签限制',
        message: '发现<a>标签，微信不支持SVG内超链接',
        tagName: 'a',
        codeSnippet: serializeNode(el),
        suggestion: '移除超链接，或使用外层HTML包裹链接',
      });
    }

    // 规则1: 白名单属性检查 - animate
    if (tagName === 'animate') {
      const attrName = el.getAttribute('attributeName');
      if (attrName && !ANIMATE_WHITELIST.has(attrName)) {
        issues.push({
          severity: 'error',
          rule: '动画属性白名单',
          message: `<animate> 使用了不在白名单中的 attributeName: "${attrName}"`,
          detail: `白名单属性: ${Array.from(ANIMATE_WHITELIST).join(', ')}`,
          tagName: 'animate',
          attributeName: attrName,
          codeSnippet: serializeNode(el),
          suggestion: `将 attributeName 改为白名单中的属性，如 "x", "y", "opacity" 等`,
        });
      }

      // 规则4: repeatCount限制
      if (attrName === 'height' || attrName === 'width') {
        const repeatCount = el.getAttribute('repeatCount');
        if (repeatCount === 'indefinite') {
          issues.push({
            severity: 'error',
            rule: 'repeatCount限制',
            message: `<animate attributeName="${attrName}"> 使用 repeatCount="indefinite" 会被微信替换为undefined`,
            tagName: 'animate',
            attributeName: 'repeatCount',
            codeSnippet: serializeNode(el),
            suggestion: `将 repeatCount 设置为具体数值，如 "1" 或省略该属性`,
          });
        }
      }
    }

    // 规则1: 白名单属性检查 - set
    if (tagName === 'set') {
      const attrName = el.getAttribute('attributeName');
      if (attrName && !SET_WHITELIST.has(attrName)) {
        issues.push({
          severity: 'error',
          rule: '动画属性白名单',
          message: `<set> 使用了不在白名单中的 attributeName: "${attrName}"`,
          detail: `<set> 元素仅允许 attributeName="visibility"`,
          tagName: 'set',
          attributeName: attrName,
          codeSnippet: serializeNode(el),
          suggestion: '将 attributeName 改为 "visibility"',
        });
      }
    }

    // 规则1: 白名单属性检查 - animateTransform
    if (tagName === 'animatetransform' || tagName === 'animateTransform') {
      const type = el.getAttribute('type');
      if (type && !ANIMATE_TRANSFORM_WHITELIST.has(type)) {
        issues.push({
          severity: 'error',
          rule: '动画属性白名单',
          message: `<animateTransform> 使用了不在白名单中的 type: "${type}"`,
          detail: `白名单类型: ${Array.from(ANIMATE_TRANSFORM_WHITELIST).join(', ')}`,
          tagName: 'animateTransform',
          attributeName: 'type',
          codeSnippet: serializeNode(el),
          suggestion: '将 type 改为白名单中的类型，如 "translate", "scale", "rotate" 等',
        });
      }
    }

    // 规则1: animateMotion只允许path属性
    if (tagName === 'animatemotion' || tagName === 'animateMotion') {
      const path = el.getAttribute('path');
      if (isNil(path)) {
        const hasMpath = el.querySelector('mpath');
        if (isNil(hasMpath)) {
          // 检查是否有其他不允许的属性
          const allowedAttrs = new Set(['path', 'begin', 'dur', 'repeatcount', 'fill', 'keypoints', 'keysplines', 'calcmode', 'values']);
          for (const attr of el.attributes) {
            if (!allowedAttrs.has(attr.name.toLowerCase())) {
              issues.push({
                severity: 'error',
                rule: '动画属性白名单',
                message: `<animateMotion> 包含不允许的属性: "${attr.name}"`,
                detail: '<animateMotion> 主要使用 path 属性定义运动路径',
                tagName: 'animateMotion',
                attributeName: attr.name,
                codeSnippet: serializeNode(el),
                suggestion: '使用 path 属性定义运动路径',
              });
            }
          }
        }
      }
    }

    // 检查元素属性（id、事件处理器、CSS）
    checkElementAttributes(el, tagName);

    // 递归子节点
    el.childNodes.forEach(traverseNode);
  }

  // 提取共用：检查元素属性（id、事件处理器、CSS限制）
  function checkElementAttributes(el: Element, tagName: string) {
    // 规则2: 事件处理器属性检查 + id属性检查
    for (const attr of el.attributes) {
      const attrName = attr.name.toLowerCase();

      // id属性检查
      if (attrName === 'id') {
        issues.push({
          severity: 'error',
          rule: 'JavaScript禁用',
          message: `发现 id 属性，微信会删除所有 id 属性`,
          detail: `id="${attr.value}"`,
          tagName,
          attributeName: 'id',
          codeSnippet: `<${tagName} ${attrName}="${attr.value}">`,
          suggestion: '移除id属性，如需选择元素可使用class或其他方式',
        });
      }

      // 事件处理器检查
      if (EVENT_HANDLER_PATTERN.test(attrName)) {
        issues.push({
          severity: 'error',
          rule: 'JavaScript禁用',
          message: `发现事件处理器属性: ${attrName}`,
          detail: `${attrName}="${attr.value}"`,
          tagName,
          attributeName: attrName,
          codeSnippet: `<${tagName} ${attrName}="${attr.value}">`,
          suggestion: '移除所有on*事件属性，使用SMIL的begin="click"等交互方式',
        });
      }
    }

    // 规则3: CSS限制检查
    const styleAttr = el.getAttribute('style');
    if (styleAttr) {
      // 检查position
      const positionMatch = styleAttr.match(/position\s*:\s*(absolute|relative|fixed|sticky)/i);
      if (positionMatch) {
        issues.push({
          severity: 'warning',
          rule: 'CSS限制',
          message: `发现 position: ${positionMatch[1]} 样式`,
          detail: `微信SVG不支持position属性`,
          tagName,
          attributeName: 'style',
          codeSnippet: `style="${styleAttr}"`,
          suggestion: '移除position属性，使用SVG的x、y属性控制位置',
        });
      }

      // 检查极端负外边距
      const marginMatch = styleAttr.match(/margin-(?:left|top)\s*:\s*(-\d+%)/i);
      if (marginMatch) {
        issues.push({
          severity: 'warning',
          rule: 'CSS限制',
          message: `发现极端负外边距值: ${marginMatch[0]}`,
          detail: '微信可能会过滤此类样式',
          tagName,
          attributeName: 'style',
          codeSnippet: `style="${styleAttr}"`,
          suggestion: '使用SVG transforms或其他方式实现位移效果',
        });
      }
    }
  }

  // 先检查根SVG元素自身的属性（id、事件处理器、style等）
  checkElementAttributes(rootSVG, 'svg');

  rootSVG.childNodes.forEach(traverseNode);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return {
    valid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
    infoCount,
  };
}

// 白名单速查数据
export const WHITELIST_DATA = {
  animate: {
    element: 'animate',
    attribute: 'attributeName',
    allowedValues: Array.from(ANIMATE_WHITELIST),
  },
  set: {
    element: 'set',
    attribute: 'attributeName',
    allowedValues: Array.from(SET_WHITELIST),
  },
  animateTransform: {
    element: 'animateTransform',
    attribute: 'type',
    allowedValues: Array.from(ANIMATE_TRANSFORM_WHITELIST),
  },
  animateMotion: {
    element: 'animateMotion',
    attribute: 'path',
    allowedValues: ['path (属性)'],
  },
};

// 示例数据

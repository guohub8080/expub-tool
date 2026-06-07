import defaultTo from 'lodash/defaultTo'
import type { I_CamaraStageProps, BakedFrame, CanonicalTrack, I_BakeResult } from '../types'
import { sampleCamera } from './sampleCamera'
import { resolveObject } from './resolveObject'

/**
 * bake — 完整的烘焙管线
 *
 * 输入：Props（camera, scenes, viewport, ...）
 * 过程：按 sampleRate 采样时间轴，对每个 scene+object 调用 resolveObject
 * 输出：{ tracks: CanonicalTrack[], totalDuration }
 *
 * 上游 solver 可替换，下游 SVG 编译器只读 CanonicalTrack。
 */
export function bake(props: I_CamaraStageProps): I_BakeResult {
  const {
    camera, scenes, viewport,
    focalLength: f = 300,
    sampleRate = 30,
  } = props

  const totalDuration = camera.timeline.reduce((sum, seg) => sum + seg.durationSeconds, 0)
  const totalFrames = Math.ceil(totalDuration * sampleRate)

  const tracks: CanonicalTrack[] = []

  for (const scene of scenes) {
    for (const object of scene.objects) {
      const frames: BakedFrame[] = []

      for (let i = 0; i <= totalFrames; i++) {
        const normalizedT = totalFrames > 0 ? i / totalFrames : 0
        const t = normalizedT * totalDuration

        const cameraPos = sampleCamera(camera, t)
        const resolved = resolveObject({
          object, scene, cameraPos, focalLength: f,
        })

        frames.push({
          t: normalizedT,
          tx: resolved.tx,
          ty: resolved.ty,
          scale: resolved.scale,
          opacity: resolved.opacity,
        })
      }

      tracks.push({
        id: `${scene.id}.${object.id}`,
        sceneId: scene.id,
        kind: scene.kind,
        frames,
        size: defaultTo(object.size, { w: viewport.width, h: viewport.height }),
        asset: object.asset,
      })
    }
  }

  return { tracks, totalDuration }
}

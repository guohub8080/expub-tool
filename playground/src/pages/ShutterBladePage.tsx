import { ShutterBlade } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 360 }}>
    <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{title}</h3>
    {children}
  </div>
)

const Bg = ({ w, h, img }: { w: number; h: number; img: string }) => (
  <foreignObject x={0} y={0} width={w} height={h}>
    <svg viewBox={`0 0 ${w} ${h}`} style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', width: '100%' }} />
  </foreignObject>
)

export default function ShutterBladePage() {
  return (
    <div>
      <h2>ShutterBlade — 相机快门叶片</h2>

      <CopyDemo title="默认 8 叶片（方图 300×300）">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }}>
          <Bg w={300} h={300} img={getWechat300x300(1)} />
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="16 叶片（更精细）">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={16}>
          <Bg w={300} h={300} img={getWechat300x300(2)} />
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="竖图 300×500（非方形）">
        <ShutterBlade canvasSize={{ w: 300, h: 500 }}>
          <Bg w={300} h={500} img={getWechat300x500(1)} />
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="快节奏（开 0.2s / 停 0.3s）">
        <ShutterBlade
          canvasSize={{ w: 300, h: 300 }}
          openDuration={0.2}
          openStay={0.3}
          closeDuration={0.2}
          closeStay={0.3}
        >
          <Bg w={300} h={300} img={getWechat300x300(3)} />
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="浅色叶片">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }} bladeFill="#e5e7eb" bladeStroke="#9ca3af">
          <Bg w={300} h={300} img={getWechat300x300(4)} />
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="16 叶片 + 竖图 300×500">
        <ShutterBlade canvasSize={{ w: 300, h: 500 }} blades={16}>
          <Bg w={300} h={500} img={getWechat300x500(2)} />
        </ShutterBlade>
      </CopyDemo>
    </div>
  )
}

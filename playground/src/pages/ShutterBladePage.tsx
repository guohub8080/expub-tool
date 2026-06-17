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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <CopyDemo title="6 叶片（棱角分明）">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={6}>
            <Bg w={300} h={300} img={getWechat300x300(1)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="8 叶片（默认）">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }}>
            <Bg w={300} h={300} img={getWechat300x300(2)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="10 叶片">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={10}>
            <Bg w={300} h={300} img={getWechat300x300(3)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="12 叶片">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={12}>
            <Bg w={300} h={300} img={getWechat300x300(4)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="16 叶片（最接近圆）">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={16}>
            <Bg w={300} h={300} img={getWechat300x300(5)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="ease-out 缓动（猛冲后缓停）">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} keySplines="0 0 0.2 1">
            <Bg w={300} h={300} img={getWechat300x300(6)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="线性（匀速，无缓动）">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} keySplines="0 0 1 1">
            <Bg w={300} h={300} img={getWechat300x300(7)} />
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
            <Bg w={300} h={300} img={getWechat300x300(8)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="竖图 300×500（8 叶片）">
          <ShutterBlade canvasSize={{ w: 300, h: 500 }}>
            <Bg w={300} h={500} img={getWechat300x500(1)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="竖图 300×500（16 叶片）">
          <ShutterBlade canvasSize={{ w: 300, h: 500 }} blades={16}>
            <Bg w={300} h={500} img={getWechat300x500(2)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="浅色叶片（#e5e7eb / #9ca3af）">
          <ShutterBlade canvasSize={{ w: 300, h: 300 }} bladeFill="#e5e7eb" bladeStroke="#9ca3af">
            <Bg w={300} h={300} img={getWechat300x300(1)} />
          </ShutterBlade>
        </CopyDemo>

        <CopyDemo title="慢开快关（open 1s / close 0.2s）">
          <ShutterBlade
            canvasSize={{ w: 300, h: 300 }}
            openDuration={1}
            closeDuration={0.2}
          >
            <Bg w={300} h={300} img={getWechat300x300(2)} />
          </ShutterBlade>
        </CopyDemo>
      </div>
    </div>
  )
}

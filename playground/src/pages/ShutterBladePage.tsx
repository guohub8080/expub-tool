import { ShutterBlade } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 360 }}>
    <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{title}</h3>
    {children}
  </div>
)

export default function ShutterBladePage() {
  return (
    <div>
      <h2>ShutterBlade — 相机快门叶片</h2>

      <CopyDemo title="默认（6 叶片，后置图，开合循环）">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }}>
          <foreignObject x={0} y={0} width={300} height={300}>
            <svg viewBox="0 0 300 300" style={{
              backgroundImage: `url(${getWechat300x300(1)})`,
              backgroundSize: 'cover',
              width: '100%',
            }} />
          </foreignObject>
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="8 叶片">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={8}>
          <foreignObject x={0} y={0} width={300} height={300}>
            <svg viewBox="0 0 300 300" style={{
              backgroundImage: `url(${getWechat300x300(2)})`,
              backgroundSize: 'cover',
              width: '100%',
            }} />
          </foreignObject>
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="4 叶片 + 大角度（openAngle=60，露得多）">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }} blades={4} openAngle={60}>
          <foreignObject x={0} y={0} width={300} height={300}>
            <svg viewBox="0 0 300 300" style={{
              backgroundImage: `url(${getWechat300x300(3)})`,
              backgroundSize: 'cover',
              width: '100%',
            }} />
          </foreignObject>
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="快节奏（开 0.15s / 停 0.4s）">
        <ShutterBlade
          canvasSize={{ w: 300, h: 300 }}
          openDuration={0.15}
          openStay={0.4}
          closeDuration={0.15}
          closeStay={0.4}
        >
          <foreignObject x={0} y={0} width={300} height={300}>
            <svg viewBox="0 0 300 300" style={{
              backgroundImage: `url(${getWechat300x300(4)})`,
              backgroundSize: 'cover',
              width: '100%',
            }} />
          </foreignObject>
        </ShutterBlade>
      </CopyDemo>

      <CopyDemo title="白色叶片（曝光感）">
        <ShutterBlade canvasSize={{ w: 300, h: 300 }} bladeColor="#fde68a">
          <foreignObject x={0} y={0} width={300} height={300}>
            <svg viewBox="0 0 300 300" style={{
              backgroundImage: `url(${getWechat300x300(5)})`,
              backgroundSize: 'cover',
              width: '100%',
            }} />
          </foreignObject>
        </ShutterBlade>
      </CopyDemo>
    </div>
  )
}

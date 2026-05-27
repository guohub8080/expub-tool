import type { CSSProperties } from "react";
import SectionEx from "@html/basicEx/SectionEx";
import { spacingZeroCss } from "@css-fn/spacing";

const NormalSvgImg = (props: { url: string }) => {
  return <>
    <SectionEx
      style={{ ...spacingZeroCss, marginLeft: "auto", marginRight: "auto", pointerEvents: "none", }}
      important={[["max-width", "100%"], ["width", "100%"], ["height", "auto"]]}
      {...{ "enable-z-optimization": "true" }}
    >
      <section style={{ overflow: "hidden", WebkitTapHighlightColor: "transparent" as any, ...spacingZeroCss }}>
        <section style={{ fontSize: 0, height: 0, opacity: 0, ...spacingZeroCss, lineHeight: 0 }}>
          <p style={{ ...spacingZeroCss, fontSize: "inherit", lineHeight: "inherit" }}><span style={{ ...spacingZeroCss }}>&nbsp;</span></p>
        </section>
        <section style={{ pointerEvents: "none", fontSize: 0, lineHeight: 0, ...spacingZeroCss }}>
          <section style={{ fontSize: 0, ...spacingZeroCss }}>
            <section style={{ fontSize: 0 }}>
              <section style={{ lineHeight: 0, fontSize: 0, marginTop: 0, ...spacingZeroCss }}>
                <span style={{ fontSize: "inherit", lineHeight: "inherit", ...spacingZeroCss }}>
                  <img
                    style={{
                      display: "block",
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      width: "100%",
                      pointerEvents: "painted" as unknown as CSSProperties["pointerEvents"],
                      verticalAlign: "top",
                      opacity: 1,
                    }}
                    src={props.url}
                    data-src={props.url}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                </span>
              </section>
            </section>
          </section>
        </section>
        <section style={{ height: 1, marginTop: -1 }}>
          <span><br /></span>
        </section>
      </section>
    </SectionEx>
    <section style={{ fontSize: 0, visibility: "hidden", marginBottom: 0, maxHeight: 0, maxWidth: 0, overflow: "hidden" }}>
      <span ><br />&nbsp;</span>
    </section>
  </>
}

export default NormalSvgImg

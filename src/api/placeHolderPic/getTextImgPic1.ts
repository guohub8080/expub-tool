import googleColors from "@colors/googleColors";
import chroma from "chroma-js"

const getTextImgPic1 = (w: number, h: number, text: string) => {
  const colors = Object.values(googleColors) as string[];
  const bgColorWithHash = colors[Math.floor(Math.random() * colors.length)]!;
  const bgColor = bgColorWithHash.replace("#", "");
  let textColor = "000000";
  if (chroma(bgColorWithHash).get("hsl.l") < 0.5) textColor = "FFFFFF";
  return `https://placehold.co/${w}x${h}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}
export default getTextImgPic1
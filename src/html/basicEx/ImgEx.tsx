import React from "react";
import { defaultTo, isEmpty } from "lodash-es";
// import GetPlaceHolderPic1 from "@api/placeHolderPic/getPlaceHolderPic1";
import { useImportant } from "./useImportant";

interface ImgExProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** 图片地址 */
  url?: string;
  /** 需要添加 !important 的样式属性 */
  important?: [string, string | null | undefined][];
  /** 水印属性 */
  waterMark?: Record<string, any>;
}

const ImgEx: React.FC<ImgExProps> = ({ style, important, url, waterMark, ...rest }) => {
  const { ref, hasImportant } = useImportant<HTMLImageElement>(important);

  const imgUrl = url // defaultTo(url, GetPlaceHolderPic1());

  const commonProps = {
    style,
    ...waterMark,
    ...rest,
    referrerPolicy: "no-referrer" as const,
    src: imgUrl,
    "data-src": imgUrl,
    alt: "",
  };

  if (!hasImportant) {
    return <img {...commonProps} />;
  }

  return <img ref={ref} {...commonProps} />;
};
export default ImgEx;

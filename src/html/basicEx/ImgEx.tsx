import React from "react";
import defaultTo from "lodash/defaultTo";
import isEmpty from "lodash/isEmpty";;
// import GetPlaceHolderPic1 from "@api/placeHolderPic/getPlaceHolderPic1";
import { useImportant } from "./useImportant";
import { resolveWatermark } from "./resolveWatermark";

interface ImgExProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  url?: string;
  important?: [string, string | null | undefined][];
  watermark?: Record<string, any>;
  noWatermark?: boolean;
}

const ImgEx: React.FC<ImgExProps> = ({ style, important, url, watermark, noWatermark, ...rest }) => {
  const { ref, hasImportant } = useImportant<HTMLImageElement>(important);

  const imgUrl = url // defaultTo(url, GetPlaceHolderPic1());

  const commonProps = {
    style,
    ...resolveWatermark(watermark, noWatermark),
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

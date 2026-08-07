import Image from "next/image";
import { FC } from "react";

import { cn } from "@/src/lib/utils";
import LogoImg from "../../../public/assets/icons/LOGO1.png";

interface LogoProps {
  width?: string;
  height?: string;
  className?: string;
}

/** Salamo mark — image file has extra padding; scale fills the visible area. */
const Logo: FC<LogoProps> = ({ width = "100%", height = "140px", className }) => (
  <div
    className={cn("relative z-50 flex shrink-0 items-center justify-center overflow-hidden", className)}
    style={{ width, height }}
  >
    <Image
      src={LogoImg}
      alt="Salamo"
      fill
      priority
      className="object-contain scale-[2.4]"
      sizes="(max-width: 300px) 280px, 280px"
    />
  </div>
);

export default Logo;

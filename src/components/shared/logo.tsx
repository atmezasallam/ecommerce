//React, next.js
import Image from "next/image";
import { FC } from "react";
// Logo image (correct relative path from `src/components/shared/`)
import LogoImg from "../../../public/assets/icons/LOGO1.png";


interface LogoProps {
width:string;
height:string;
}

const Logo:FC<LogoProps>=({width,height})=>{
 return ( <div className="z-50" style={{width:width,height:height}}>  
 <Image

 src={LogoImg}
 alt="salamo"
 className="h-full w-full overflow-visible object-contain"
 />
 
 
  </div>
 );

}
 
export default Logo;

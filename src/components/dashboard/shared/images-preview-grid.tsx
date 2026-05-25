//react,nextjs
import {FC,SetStateAction,Dispatch,useState,useEffect} from "react";
//nextjs
import Image from "next/image";

//import of the images shown when there are no images available

import NoImageImg from '@/public/assets/images/no_image_2.png';



//utils
import { getGridClassName,getDominantColors,cn } from "@/src/lib/utils";
//icons
import { Trash } from "lucide-react";
import ColorPalette from "./color-palette";






interface ImagesPreviewGridProps {
    images:{url:string}[];//array of images
    onRemove:(url:string)=>void;//function to remove an image
    colors?:{color:string}[];//array of colors
    setColors:React.Dispatch<React.SetStateAction<{color:string}[]>>;//function to set the colors
}




const ImagesPreviewGrid:FC<ImagesPreviewGridProps>=({
    images,
    onRemove,
    colors,
    setColors,


})=>{

//calculate the number of images
let imagesLength = images.length;




//get the grid class name based on the number fo images 
const GridClassName =getGridClassName(imagesLength);



//extract colors from the images
const [colorPalette,setColorPalette] =useState<string[][]>([]);
useEffect(()=>{
const fetchColors = async () => {
  const palettes = await Promise.all(images.map(async (img) => {
   try{
    const colors= await getDominantColors(img.url);
   return colors;
   } catch (error) {

    return [];
   }

}))

setColorPalette(palettes);
};
if(images.length > 0){
    fetchColors();
}
},[images]);

console.log("colorPalette--",colorPalette);



//if there are no images available, display a palaceholder image

if(imagesLength === 0){
    return <div>
        <Image  src={NoImageImg}
        alt="no image available"
         width={500}
         height={600}
         className="rounded-md"
         />
    </div>;
} else {
//if there are images available, display them in a grid
return (
    <div className="max-w-4xl ">
         <div className={cn("grid h-[800px] overflow-hidden bg-surface rounded-md ",
            GridClassName
         )}>
            {

                images.map((img,i) => (
                    <div key={i} className={cn("relative group h-full w-full border border-border",
                        `grid_${imagesLength}_image_${i+1}`,
                        {
                            "h-[266.66px]" : images.length===6,
                        }

                    )}
                    
                    > 
                            {/*    Image   */}  
                            <Image 
                            src={img.url}
                            alt=""
                            width={800}
                            height={800}
                            className="w-full h-full object-cover object-top"
                        
                            />

                            {/*  Action    */}
                            <div className={cn("absolute top-0 left-0 right-0 bottom-0 hidden group-hover:flex bg-surface/55 cursor-pointer  items-center justify-center flex-col gap-y-3 transition-all duration-500",{

                                "!pb-[40%]":imagesLength===1,


                            }
                        )}

                            
                            
                            >
                            {/* color palette (extract colors) */}
                              {colorPalette[i] && colorPalette[i].length > 0 && (
                                <ColorPalette 
                                  colors={colors} 
                                  setColors={setColors}
                                  extractedColors={colorPalette[i]}
                                />
                              )}




                            
                            {/*           delete button        */}
                            <button className="Btn" type ="button" onClick={()=>onRemove(img.url)}   
                           >

                            <div className="sign">
                                <Trash size={18}/>
                            </div>
                                                       <div className="text">Delete</div>

                           </button>




                            </div>
                            

                    </div>               
               ))}

         </div>
              

    </div>
);

}




};




export default ImagesPreviewGrid;



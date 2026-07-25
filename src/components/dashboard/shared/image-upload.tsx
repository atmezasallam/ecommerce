"use client";
//react,nextjs
import { FC,use,useState,useEffect } from "react"
import  Image from "next/image";
//cloudinary
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/src/components/ui/button";
import { Trash } from "lucide-react";
import { CLOUDINARY_UPLOAD_PRESET } from "@/src/lib/cloudinary-config";

interface ImageUploadProps {
    disabled?: boolean;
    onChange:(value:string)=>void;
    onRemove:(value:string)=>void;
    value: string[];
    type:"standard" | "profile" | "cover";
    dontShowPreview?:boolean;
    cloudinary_key:string;
      error?: boolean;
}


const ImageUplode:FC<ImageUploadProps>=({
disabled,
onChange,
onRemove,
value,
type,
dontShowPreview,
 
error,
})=>{
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if(!isMounted){
    return null;
  }


    const onUpload = (result: any) => {
      console.log("result",result);
      onChange(result.info.secure_url);
    };

    if(type==="profile"){
      return(
         <div className="relative inset-x-0 rounded-full w-full max-w-80 h-80 bg-base border-2 border-white shadow-2xl">
           {
             value.length>0 && (
             <>
             <Image
              src={value[0]}
               alt="" 
               width={320} 
               height={320}
               className="w-full h-full rounded-full object-cover absolute top-0 left-0 bottom-0 right-0" />
             <Button
               type="button"
               variant="destructive"
               size="icon"
               className="absolute top-3 left-3 z-30 rounded-full shadow-md"
               disabled={disabled}
               onClick={() => onRemove(value[0])}
               aria-label="Remove logo"
             >
               <Trash className="w-4 h-4" />
             </Button>
             </>
          ) }
          <CldUploadWidget uploadPreset={CLOUDINARY_UPLOAD_PRESET} onSuccess={onUpload}  >

            {({ open }) => {
            const onClick = () => {
              open();
            };

            return (        
              <>
                <button
                  type="button"
                  className="z-20 absolute right-0 bottom-6 flex items-center font-medium text-[17px] h-14 w-14 justify-center  text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm"

  
                  disabled={disabled}
                  onClick={onClick}
                >
                  <svg
                    viewBox="0 0 640 512"
                    fill="white"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                </button>
              </>
            );
          }}













          </CldUploadWidget>
      
      </div> 
      );  
    }
    
    else if (type === "cover") {
  return (
    <CldUploadWidget uploadPreset={CLOUDINARY_UPLOAD_PRESET} onSuccess={onUpload}>
      {({ open }) => {
        const onClick = () => {
          if (!disabled) open();
        };

        return (
          <div
            style={{ height: "348px" }}
            className="relative w-full rounded-lg bg-gradient-to-b from-base via-gray-100 to-surface overflow-hidden"
          >
            {value.length > 0 && (
              <Image
                src={value[0]}
                alt=""
                width={1200}
                height={1200}
                className="w-full h-full rounded-lg object-cover"
              />
            )}

            {value.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="z-30 absolute top-4 left-4 rounded-full shadow-md"
                disabled={disabled}
                onClick={() => onRemove(value[0])}
                aria-label="Remove cover image"
              >
                <Trash className="w-4 h-4" />
              </Button>
            )}

            <button
              type="button"
              className="z-20 absolute bottom-4 right-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-primary to-blue-300 border-none shadow-lg hover:shadow-md active:shadow-sm"
              disabled={disabled}
              onClick={onClick}
            >
              <svg
                viewBox="0 0 640 512"
                fill="white"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
              </svg>
              <span>Upload a cover</span>
            </button>
          </div>
        );
      }}
    </CldUploadWidget>
  );
}

    
    
    else { 
      return (

        <div>

 <div className="mb-4 flex item-center gap-4 flex-wrap">
          {value.length > 0 && !dontShowPreview &&
          
          value.map((imageUrl) => (
            <div key={imageUrl}
            className="relative w-[200px] h-[200px]"
            
            >

              {/*  delete image button    */ }
             
             <div className="z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <Button 
               type="button" 
               variant="destructive" 
               size="icon" 
               className="rounded-full"
               onClick={() => onRemove(imageUrl)}
             >
               <Trash className="w-4 h-4"/>
             </Button>
             </div>

              {/*      image              */ }
              <Image
              fill
              className="object-cover rounded-md"
              alt=""
              src={imageUrl}
              
              
              />
            </div>
          ))
          }
            
          
        </div>
        <CldUploadWidget uploadPreset={CLOUDINARY_UPLOAD_PRESET} onSuccess={onUpload}>
      {({ open }) => {
        const onClick = () => {
          if (!disabled) open();
        };

        // If dontShowPreview is true, show just the button without background
        if (dontShowPreview) {
          return (
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-primary to-blue-300 border-none shadow-lg hover:shadow-md active:shadow-sm"
              disabled={disabled}
              onClick={onClick}
            >
              <svg
                viewBox="0 0 640 512"
                fill="white"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
              </svg>
              <span>Upload Images</span>
            </button>
          );
        }

        return (
          <div
            style={{ height: "348px" }}
            className="relative w-full rounded-lg bg-gradient-to-b from-base via-gray-100 to-surface overflow-hidden"
          >
            {value.length > 0 && (
              <Image
                src={value[0]}
                alt=""
                width={1200}
                height={1200}
                className="w-full h-full rounded-lg object-cover"
              />
            )}

            <button
              type="button"
              className="z-20 absolute bottom-4 right-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-primary to-blue-300 border-none shadow-lg hover:shadow-md active:shadow-sm"
              disabled={disabled}
              onClick={onClick}
            >
              <svg
                viewBox="0 0 640 512"
                fill="white"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
              </svg>
              <span>Upload a cover</span>
            </button>
          </div>
        );
      }}
    </CldUploadWidget>

        </div>

    )
      
    }

        
        
};


export default ImageUplode;

















/*
 onChange: (url?: string) => void;  inset-x-96
    onUploadError: (error: Error) => void;*/
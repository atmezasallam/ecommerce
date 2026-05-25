import { Size } from "@prisma/client";
import { FC,useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
    sizes: Size[];
    sizeId: string | undefined;
  }

  const SizeSelector: FC<Props> = ({ sizeId, sizes }) => {
    const pathname = usePathname();
    const { replace } = useRouter();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);


    const handleSelectSize = (size: Size) => {
        params.set("size", size.id);
        replace(`${pathname}?${params.toString()}`);
      };
    


    return (
        <div className="flex flex-wrap gap-4">
          {sizes.map((size) => (
            <span
              key={size.size}
              className="border rounded-full px-5 py-1 cursor-pointer hover:border-black"
              style={{ borderColor: size.id === sizeId ? "#000" : "" }}
              onClick={() => handleSelectSize(size)}
            >
              {size.size}
            </span>
          ))}
        </div>
      );
    };
    




  export default SizeSelector;
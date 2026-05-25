
import { CartProductType } from "@/src/lib/types";
import { Size } from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import { FC, useEffect, useMemo } from "react";



interface QuantitySelectorProps {
    productId: string;
    variantId: string;
    sizeId: string | null;
    quantity: number;
    stock: number;
    handleChange: (property: keyof CartProductType, value: any) => void;
    sizes: Size[];
  }
  


  const QuantitySelector: FC<QuantitySelectorProps> = ({
    handleChange,
  productId,
  quantity,
  sizeId,
  sizes,
  variantId,
  stock,

  }) => {

     // If no sizeId is provided, return null to prevent rendering the component
  if (!sizeId) return null;

   // useEffect hook to handle changes when sizeId updates
   useEffect(() => {
    handleChange("quantity", 1);
  }, [sizeId]);

  // Calculate maxQty (maximum available quantity)
  // If cart information is available, this would be stock minus items already in cart
  // For now, we assume all stock is available
  const maxQty = stock;

   // Function to handle increasing the quantity of the product
   const handleIncrease = () => {
    if (quantity < stock) {
      handleChange("quantity", quantity + 1);
    }
  };

   // Function to handle decreasing the quantity of the product
   const handleDecrease = () => {
    if (quantity > 1) {
      handleChange("quantity", quantity - 1);
    }
  };

  return (
    <div className="w-full py-2 px-3 bg-surface border border-border rounded-lg">
      <div className="w-full flex justify-between items-center gap-x-5">
        <div className="grow">
          <span className="block text-xs text-subtle">Select quantity</span>
          <span className="block text-xs text-subtle">
            {maxQty !== stock &&
              `(You already have ${
                stock - maxQty
              } pieces of this product in cart)`}
          </span>
          <input
            type="number"
            className="w-full p-0 bg-transparent border-0 focus:outline-0 text-subtle"
            min={1}
            value= {quantity}
        
            readOnly
          />
        </div>
        <div className="flex justify-end items-center gap-x-1.5">
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-border bg-surface shadow-sm focus:outline-none focus:bg-base disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleDecrease}
            disabled={quantity === 1}
          >
            <Minus className="w-3" />
          </button>
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-border bg-surface shadow-sm focus:outline-none focus:bg-base disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleIncrease}
            disabled={quantity === stock}
          >
            <Plus className="w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};


  export default QuantitySelector; 
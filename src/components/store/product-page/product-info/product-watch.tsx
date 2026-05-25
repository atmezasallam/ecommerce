"use client";

import { FC } from "react";

interface Props {
  productId: string;
}

/** Live viewer count — add realtime (e.g. Ably/Pusher) or polling when ready. */
const ProductWatch: FC<Props> = ({ productId: _productId }) => {
  return null;
};

export default ProductWatch;

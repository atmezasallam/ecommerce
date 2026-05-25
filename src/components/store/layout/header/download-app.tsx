import Link from "next/link";
import Image from "next/image";
import { Smartphone } from "lucide-react";

import PlayStoreImg from "@/public/assets/icons/google-play.webp";
import AppStoreImg from "@/public/assets/icons/app-store.webp";

export default function DownloadApp() {
  return (
    <div className="relative group">
      <div className="flex h-11 cursor-pointer items-center px-2 text-white/80 hover:text-white">
        <span className="text-[28px] leading-none">
          <Smartphone className="h-7 w-7 stroke-[1.75]" stroke="currentColor" />
        </span>
        <b className="ml-1 text-xs font-bold leading-4">Download app</b>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-full z-[80] hidden w-[300px] -translate-x-1/2 group-hover:block">
        <div className="relative mt-2 rounded-[24px] border border-black/10 bg-white px-6 pb-6 pt-5 text-main-primary shadow-2xl">
          <div className="absolute -top-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-b-[10px] border-l-[10px] border-r-[10px] border-b-white border-l-transparent border-r-transparent" />
          <h3 className="text-center text-lg font-bold text-main-primary">
            Get the Salamo app
          </h3>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Shop faster and easier on the go
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="#"
              className="grid place-items-center rounded-xl bg-gray-900 px-4 py-2.5 transition-colors hover:bg-black"
              aria-label="Download on the App Store"
            >
              <Image
                src={AppStoreImg}
                alt="App Store"
                width={90}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
            <Link
              href="#"
              className="grid place-items-center rounded-xl bg-gray-900 px-4 py-2.5 transition-colors hover:bg-black"
              aria-label="Get it on Google Play"
            >
              <Image
                src={PlayStoreImg}
                alt="Google Play"
                width={90}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

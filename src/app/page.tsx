import Image from "next/image";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { UserButton } from "@clerk/nextjs";
 

export default function Home() {
  return( <div className="p-5">

<div className="W-100 flex gap-x-5 justify-end">
  <UserButton/>
  <ThemeToggle />
</div>

<h1 className=" text-gray-500 font-barlow">Home page</h1>

  </div>
  
);
}

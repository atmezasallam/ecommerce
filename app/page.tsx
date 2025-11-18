import Image from "next/image";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
 

export default function Home() {
  return( <div className="p-5 min-h-screen bg-background text-foreground">

<div className="W-100 flex justify-end">
  <ThemeToggle />
</div>

<h1 className=" text-gray-500 font-barlow">welcomeeeeeeeeeee</h1>
<h1 className=" text-white-500 ">welcomeeeeeeeeeee</h1>

<Button variant="destructive">
  click here
</Button>


  </div>
  
);
}

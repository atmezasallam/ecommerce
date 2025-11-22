import React from "react";
import{ SignIn } from "@clerk/nextjs";

export default function SignINPage() {
    return (
    
    <div className="h-screen w-full grid place-items-center"> 
        <SignIn />

    </div>
    
);
}

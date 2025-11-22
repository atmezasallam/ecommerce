import React from "react";
import{ SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
    
    <div className="h-screen w-full grid place-items-center"> 
        <SignUp />

    </div>
    
);
}

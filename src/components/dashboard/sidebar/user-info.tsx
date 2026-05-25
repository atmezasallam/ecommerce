import { User } from "@clerk/nextjs/server";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";



export default function UserInfo( { user } : {user:User | null}) {
const role = user?.privateMetadata?.role?.toString()
return (
<div>
         <div>  

                  <Button className="my-1 flex w-full items-center justify-between rounded-xl px-2 py-2 hover:bg-base/80 dark:hover:bg-base/60" variant="ghost">
                    <div className="flex item-center min-w-0 text-left gap-2">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage 
                            src ={user?.imageUrl} 
                            alt={`${user?.firstName!} ${user?.lastName!}`}
                            />  
                                <AvatarFallback className="bg-primary text-black">{user?.firstName} {user?.lastName}</AvatarFallback>

                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {user?.emailAddresses[0].emailAddress}
                            </span>
                            <span className="mt-1 w-fit">
                                <Badge variant="secondary" className="capitalize text-[10px]">
                                    {role?.toLocaleLowerCase()} Dashboard                                   

                                </Badge>
                            </span>
                        </div>


                    </div>    
                  </Button>  
         </div>
     
     
 </div>


)


}

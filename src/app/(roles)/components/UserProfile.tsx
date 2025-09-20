"use client";

import { useUserStore } from "@/hooks/use-user-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUserRound, LogOut, Settings, User, Truck, Store } from "lucide-react";

export function UserProfile() {
    const { user, clearUser } = useUserStore();

    if (!user) {
        return null;
    }

    const getIcon = () => {
        switch (user.role) {
            case 'FARMER': return <User className="w-4 h-4 mr-2"/>
            case 'DISTRIBUTOR': return <Truck className="w-4 h-4 mr-2"/>
            case 'RETAILER': return <Store className="w-4 h-4 mr-2"/>
            default: return <CircleUserRound className="w-4 h-4 mr-2"/>
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={`${user.name}'s profile`} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                           ID: {user.id}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        {getIcon()}
                        <span>{user.role.charAt(0) + user.role.slice(1).toLowerCase()} Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearUser}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

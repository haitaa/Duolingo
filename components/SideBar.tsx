import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ClerkLoading, ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Loader, User } from "lucide-react";

import SidebarItem from "./sidebar-item";

type Props = {
    className?: string;
};

const Sidebar = ({ className }: Props) => {
    return (
        <div
            className={cn(
                "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
                className
            )}
        >
            <Link href="/learn">
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <Image
                        src={"/mascot.svg"}
                        alt="Mascot"
                        height={40}
                        width={40}
                    />
                    <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
                        Duolingo
                    </h1>
                </div>
            </Link>
            <div className="flex flex-col gap-y-2 flex-1">
                <SidebarItem
                    iconSrc="/learn.svg"
                    label={"Learn"}
                    href="/learn"
                />
                <SidebarItem
                    iconSrc="/leaderboard.svg"
                    label={"Leaderboard"}
                    href="/leaderboard"
                />
                <SidebarItem
                    iconSrc="/quests.svg"
                    label={"quests"}
                    href="/quests"
                />
                <SidebarItem iconSrc="/shop.svg" label={"shop"} href="/shop" />
            </div>
            <div className="p-4">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton />
                </ClerkLoaded>
            </div>
        </div>
    );
};

export default Sidebar;

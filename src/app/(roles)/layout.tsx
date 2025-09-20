import { MainNav } from "./components/MainNav";
import { UserProfile } from "./components/UserProfile";

export default function RolesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-col md:flex">
            <div className="border-b">
                <div className="flex h-16 items-center justify-between px-4 container mx-auto">
                    <MainNav />
                    <UserProfile />
                </div>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {children}
            </div>
        </div>
    );
}

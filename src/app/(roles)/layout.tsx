
import { MainNav } from "./components/MainNav";
import { UserProfile } from "./components/UserProfile";

export default function RolesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-col md:flex">
            <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="flex h-16 items-center px-4 container">
                    <MainNav />
                    <div className="ml-auto flex items-center space-x-4">
                        <UserProfile />
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {children}
            </div>
        </div>
    );
}

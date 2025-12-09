"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
// import { usePathname } from "next/navigation";
// import InfoSidebar from "./InfoSidebar";
import UserSidebar from "@/components/SideBars/UserSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();
  // let activeTab: "info" | "appointments" | "medical" = "info";
  // if (pathname.startsWith("/profile/appointments")) activeTab = "appointments";
  // else if (pathname.startsWith("/profile/medical")) activeTab = "medical";

  return (
    <AuthProvider>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col`}
      >
        <div className="min-h-screen bg-gray-50 ">
          <div
            className=" !h-fit
           bg-gray-50 px-2 md:px-0"
          >
            <div
              className="flex flex-col md:flex-row w-full
              items-stretch"
            >
              <div className="flex-shrink-0 mb-4 md:mb-0 min-h-screen">
                {/* <InfoSidebar activeTab={activeTab} /> */}
                <UserSidebar />
              </div>
              <main className="flex-1 p-1 bg-white">
                <div className="w-full h-full">{children}</div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/auth/AuthProvider";
import Header from "./components/layout/Header";
import NavBar from "./components/layout/NavBar";
import { getServerSession } from "next-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  description: "A social media platform to connect with climbers and share your projects",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <Header />
          <div className="flex-grow flex flex-col bg-white">
            {session && <NavBar />}
            <main className="flex-grow container mx-auto px-4 py-6 md:py-8 mb-16 md:mb-0 bg-white">
              {children}
            </main>
          </div>
          <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-600 text-sm">
            <div className="container mx-auto px-4">
              <p>&copy; {new Date().getFullYear()} ClimbTime. All rights reserved.</p>
              <div className="mt-2 flex justify-center space-x-4">
                <a href="#" className="text-gray-500 hover:text-gray-700">Terms</a>
                <a href="#" className="text-gray-500 hover:text-gray-700">Privacy</a>
                <a href="#" className="text-gray-500 hover:text-gray-700">Help</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

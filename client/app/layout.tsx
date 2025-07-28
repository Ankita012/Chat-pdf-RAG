import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Chat Assistant",
  description: "Chat with your PDF documents using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 min-h-screen`}>
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo/Title */}
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    📄 PDF Chat Assistant
                  </h1>
                </div>

                {/* Authentication */}
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  
                  <SignedIn>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Welcome</span>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "h-8 w-8"
                          }
                        }}
                      />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <SignedOut>
              {/* Landing Page for Signed Out Users */}
              <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                  <div className="mb-8">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      PDF Chat Assistant
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Upload your PDF documents and chat with them using AI. 
                      Get instant answers from your documents.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <SignInButton mode="modal">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Sign In to Get Started
                      </button>
                    </SignInButton>
                    
                    <div className="text-sm text-gray-500">
                      New user? Click Sign In to create an account
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-12 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Features:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <span className="mr-2">✅</span>
                        Upload and chat with PDF documents
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✅</span>
                        AI-powered document analysis
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✅</span>
                        Extract key information instantly
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✅</span>
                        Source citations for accuracy
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              {children}
            </SignedIn>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
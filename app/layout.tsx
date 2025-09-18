import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Nunito_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { PageTransition } from "@/components/page-transition"
import { ThemeProvider } from "@/components/theme-provider"
import { SecurityDashboard } from "@/components/security-dashboard"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ShiftBudget - Financial Management for Shift Workers",
  description:
    "Manage your finances with paycheck-aligned budgeting, automated categorization, and shift-specific tools.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${nunitoSans.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <AppHeader />
                  <PageTransition>
                    <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">{children}</main>
                  </PageTransition>
                </SidebarInset>
              </SidebarProvider>
              <Analytics />
              <SecurityDashboard />
              <Toaster />
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

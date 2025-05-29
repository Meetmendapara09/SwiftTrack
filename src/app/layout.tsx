
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrderDataProvider } from '@/contexts/OrderDataContext';
import { Header } from '@/components/shared/Header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SwiftTrack - Delivery Management',
  description: 'Efficiently manage and track your deliveries with SwiftTrack.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <OrderDataProvider>
              <Header />
              <main className="flex-grow container mx-auto py-8 px-4">
                {children}
              </main>
              <Toaster />
            </OrderDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

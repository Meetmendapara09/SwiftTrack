
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, PackageSearch, LogIn, LayoutDashboard, Truck, Zap, UsersRound, ArrowRight } from 'lucide-react'; // Removed MapPin
import Image from 'next/image';

export default function HomePage() {
  const { user, isLoading } = useAuth(); // isLoading here is for initial auth check
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'vendor') router.push('/vendor/dashboard');
      else if (user.role === 'delivery_partner') router.push('/delivery/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your SwiftTrack experience...</p>
      </div>
    );
  }

  if (user) {
    // This state is usually brief as the useEffect above will redirect.
    // Or, it's for a logged-in customer who landed on home.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
         <Card className="w-full max-w-md shadow-xl text-center animate-in fade-in-0 zoom-in-95 duration-500">
           <CardHeader>
            <div className="mx-auto mb-4">
              <Logo size="large"/>
            </div>
            <CardTitle className="text-3xl font-semibold">Welcome back, {user.name || 'User'}!</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
            <p className="text-muted-foreground mb-6">You are logged in as a {user.role?.replace('_', ' ') || 'guest'}. Access your portal below.</p>
            {user.role === 'vendor' && <Button onClick={() => router.push('/vendor/dashboard')} className="w-full text-lg py-6">Go to Vendor Dashboard <ArrowRight className="ml-2 h-5 w-5"/></Button>}
            {user.role === 'delivery_partner' && <Button onClick={() => router.push('/delivery/dashboard')} className="w-full text-lg py-6">Go to Delivery Dashboard <ArrowRight className="ml-2 h-5 w-5"/></Button>}
            {user.role === 'customer' && ( // Or if role is not vendor/delivery
              <Link href="/auth/customer-login" passHref>
                <Button className="w-full text-lg py-6" variant="outline">
                  Track an Order
                </Button>
              </Link>
            )}
           </CardContent>
         </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-x-hidden bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <section
        className="w-full py-24 md:py-32 lg:py-40 animate-in fade-in-0 slide-in-from-top-12 duration-1000" // Reduced top padding slightly
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* The Logo component instance that was here has been removed */}
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-foreground animate-in fade-in-0 slide-in-from-bottom-12 delay-300 duration-1000">
              SwiftTrack: <span className="text-primary">Intelligent</span> Delivery, <span className="text-primary">Instantly</span> Tracked.
            </h1>
            <p className="mt-8 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-bottom-10 delay-500 duration-1000">
              Empower your logistics with our cutting-edge platform. Manage vendor orders, enable real-time delivery tracking, and provide customers with unparalleled transparency. Efficiency, delivered transparently.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in-0 zoom-in-95 delay-700 duration-700">
              <Link href="/auth/customer-login" passHref>
                <Button size="lg" className="text-lg py-4 px-12 w-full sm:w-auto shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105">
                  <PackageSearch className="mr-2.5 h-6 w-6" /> Track Your Order
                </Button>
              </Link>
              <Link href="#portals" passHref>
                <Button size="lg" variant="outline" className="text-lg py-4 px-12 w-full sm:w-auto shadow-md hover:shadow-accent/20 transition-all duration-300 transform hover:scale-105 border-2 border-primary/50 hover:border-primary">
                  <LogIn className="mr-2.5 h-6 w-6" /> Access Portals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-28 lg:py-36 bg-background animate-in fade-in-0 slide-in-from-bottom-16 duration-1000 delay-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">The SwiftTrack Advantage</h2>
            <p className="mt-6 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              Experience a comprehensive suite of tools designed for modern logistics, ensuring transparency and efficiency at every step of the delivery journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Zap, title: "Hyper-Local Real-Time Tracking", description: "Offer your customers pinpoint accuracy with live map-based tracking, updating every few seconds for ultimate transparency and engagement. Peace of mind, delivered." },
              { icon: LayoutDashboard, title: "Intuitive Vendor Dashboard", description: "Seamlessly manage incoming orders, assign deliveries to your trusted partners, and gain actionable insights into your operational performance from a centralized, user-friendly hub." },
              { icon: Truck, title: "Empowered Delivery Partner Portal", description: "Partners can easily accept assignments, track precise location updates for customer viewing, and manage their delivery manifest with unparalleled efficiency, all from their mobile device." }
            ].map((feature, index) => (
              <Card
                key={index}
                className="shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col bg-card/80 backdrop-blur-sm border-border/50 group hover:border-primary/50 animate-in fade-in-0 zoom-in-95 delay-[var(--delay)] duration-700"
                style={{ '--delay': `${400 + index * 200}ms` } as React.CSSProperties}
              >
                <CardHeader className="items-center text-center pt-10">
                  <div className="p-5 rounded-full bg-primary/10 text-primary mb-6 inline-block group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={44} strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-grow px-6 pb-8">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section for accessing portals */}
      <section id="portals" className="w-full py-20 md:py-28 lg:py-36 bg-muted/30 animate-in fade-in-0 slide-in-from-bottom-16 duration-1000 delay-400">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Ready to Revolutionize Your Deliveries?</h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground md:text-xl">
            Choose your role. Log in or sign up to take immediate control of your delivery ecosystem with SwiftTrack's powerful tools.
          </p>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { href: "/auth/vendor-login", icon: UsersRound, title: "Vendor Portal", description: "Manage Your Business Operations", delay: 500 },
              { href: "/auth/delivery-login", icon: Truck, title: "Delivery Partner Portal", description: "Handle Your Deliveries Seamlessly", delay: 650 },
              { href: "/auth/customer-login", icon: PackageSearch, title: "Track an Order", description: "View Your Order's Live Status", special: true, delay: 800 }
            ].map((portal) => (
              <Link key={portal.title} href={portal.href} passHref>
                <Card
                  className={`shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer py-10 h-full flex flex-col justify-center items-center animate-in fade-in-0 zoom-in-95 delay-[var(--delay)] duration-700 ${portal.special ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary' : 'hover:bg-accent/10 hover:border-accent/50 border-2'}`}
                  style={{ '--delay': `${portal.delay}ms` } as React.CSSProperties}
                >
                  <portal.icon className={`h-12 w-12 mb-4 ${portal.special ? '' : 'text-primary'}`} strokeWidth={1.5}/>
                  <CardTitle className="text-2xl">{portal.title}</CardTitle>
                  <CardDescription className={`mt-2 text-base ${portal.special ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{portal.description}</CardDescription>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full py-12 border-t bg-muted/50 animate-in fade-in-0 duration-1000 delay-500">
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="mb-4 sm:mb-0">
            <Logo size="normal" />
          </div>
          <p>&copy; {new Date().getFullYear()} SwiftTrack. All rights reserved. Efficiency in every delivery.</p>
        </div>
      </footer>
    </div>
  );
}

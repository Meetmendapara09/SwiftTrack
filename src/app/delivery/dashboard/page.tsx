
"use client";
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrderData } from '@/hooks/useOrderData';
import { useRouter } from 'next/navigation';
import { DeliveryOrderList } from '@/components/delivery/DeliveryOrderList';
import { Loader2, AlertTriangle, Truck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DeliveryPartnerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { getDeliveryPartnerOrders, isLoadingData: ordersLoading } = useOrderData();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'delivery_partner')) {
      router.replace('/auth/delivery-login');
    }
  }, [user, authLoading, router]);

  const isLoading = authLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== 'delivery_partner') {
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] animate-in fade-in-0 duration-500">
          <Alert variant="destructive" className="w-full max-w-lg shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg">Access Denied</AlertTitle>
            <AlertDescription>
              You must be logged in as a delivery partner to view this page. Redirecting to login...
            </AlertDescription>
          </Alert>
       </div>
    );
  }

  const partnerOrders = getDeliveryPartnerOrders(user.id);

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <div className="pb-6 border-b border-border/80 animate-in fade-in-0 slide-in-from-top-10 duration-1000">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Truck className="h-10 w-10 text-primary"/>
          Delivery Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Welcome, {user.name}! Manage your assigned deliveries efficiently.</p>
      </div>
      
      <section className="animate-in fade-in-0 slide-in-from-bottom-10 delay-200 duration-1000">
        <h2 className="text-3xl font-semibold mb-6">Your Deliveries ({partnerOrders.length})</h2>
        <DeliveryOrderList orders={partnerOrders} partnerId={user.id} />
      </section>
    </div>
  );
}

    
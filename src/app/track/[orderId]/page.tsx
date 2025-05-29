
"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrderData } from '@/hooks/useOrderData'; 
import type { Order } from '@/lib/types';
import { OrderTrackingMap } from '@/components/tracking/OrderTrackingMap';
import { OrderStatusDetails } from '@/components/tracking/OrderStatusDetails';
import { Loader2, Frown, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  
  const { isLoading: authLoading } = useAuth(); 
  const { getOrderById, fetchOrderById, isLoadingData: orderContextLoading } = useOrderData(); 
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null | undefined>(undefined); 
  // isLoadingInitial is for the specific fetch of *this* order, distinct from context's global loading
  const [isLoadingInitialOrder, setIsLoadingInitialOrder] = useState(true);
  const prevStatusRef = useRef<Order['status'] | undefined>();

  // Effect to fetch initial order data specifically for this page
  useEffect(() => {
    let isMounted = true;
    if (orderId) {
      setIsLoadingInitialOrder(true);
      fetchOrderById(orderId).then(fetchedOrder => {
        if (isMounted) {
          setOrder(fetchedOrder);
          if (fetchedOrder) {
            prevStatusRef.current = fetchedOrder.status;
          }
          setIsLoadingInitialOrder(false);
        }
      }).catch(err => {
        if (isMounted) {
          console.error("Failed to fetch order by ID on track page:", err);
          setOrder(null);
          setIsLoadingInitialOrder(false);
        }
      });
    } else {
      setIsLoadingInitialOrder(false);
      setOrder(null);
    }
    return () => { isMounted = false; };
  }, [orderId, fetchOrderById]);

  // Effect to observe changes in the specific order (from context, due to socket updates)
  useEffect(() => {
    const currentOrderFromContext = getOrderById(orderId); // This gets potentially real-time data from context
    if (currentOrderFromContext) {
      // Update local order state if it differs from context 
      if (JSON.stringify(order) !== JSON.stringify(currentOrderFromContext)) {
        setOrder(currentOrderFromContext);
      }

      // Check for status change to show toast
      if (prevStatusRef.current && currentOrderFromContext.status !== prevStatusRef.current && prevStatusRef.current !== undefined) {
        toast({
          title: "Order Status Update!",
          description: `Your order #${currentOrderFromContext.id.slice(0,8)} is now: ${currentOrderFromContext.status}.`,
          variant: "default",
          duration: 8000,
        });
      }
      prevStatusRef.current = currentOrderFromContext.status;
    } else if (order !== null && !isLoadingInitialOrder && !orderContextLoading) { 
    }
  }, [getOrderById, orderId, toast, order, isLoadingInitialOrder, orderContextLoading]);


  if (authLoading || isLoadingInitialOrder) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-4 animate-in fade-in-0 duration-500">
        <Card className="p-8 shadow-xl max-w-lg animate-in fade-in-0 zoom-in-95 delay-150 duration-500">
          <Frown className="w-20 h-20 text-destructive mb-6 mx-auto" />
          <h2 className="text-3xl font-semibold mb-3">Order Not Found</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We couldn't find an order with ID: <span className="font-semibold text-foreground">{orderId}</span>. 
            Please check the ID or try tracking another order.
          </p>
          <Button onClick={() => router.push('/auth/customer-login')} size="lg" className="text-base py-3">
            <PackageSearch className="mr-2 h-5 w-5"/> Track Another Order
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-10 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <div className="pb-6 border-b border-border/80 text-center md:text-left animate-in fade-in-0 slide-in-from-top-10 duration-1000">
        <h1 className="text-4xl font-bold tracking-tight">Track Your Order</h1>
        <p className="text-lg text-muted-foreground mt-2">Real-time updates for order <span className="font-semibold text-primary">#{order.id.slice(0,8)}</span>.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6 animate-in fade-in-0 slide-in-from-left-10 delay-200 duration-1000">
          <OrderStatusDetails order={order} />
        </div>
        <div className="lg:col-span-2 lg:sticky lg:top-24 animate-in fade-in-0 slide-in-from-right-10 delay-300 duration-1000">
          <OrderTrackingMap location={
            order.current_location_lat && order.current_location_lng 
            ? { lat: order.current_location_lat, lng: order.current_location_lng } 
            : undefined
          } orderId={order.id} />
        </div>
      </div>
    </div>
  );
}

    
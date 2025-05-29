
"use client";
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderData } from '@/hooks/useOrderData';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Package, Navigation, Ban, CheckCircle, User, Truck, List, LocateFixed, Info, Loader2, Clock } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SkeletonOrderCard } from '@/components/shared/SkeletonOrderCard';

interface DeliveryOrderListProps {
  orders: Order[];
  partnerId: string; 
}

export function DeliveryOrderList({ orders, partnerId }: DeliveryOrderListProps) {
  const { updateOrderStatus, updateOrderLocation, getOrderById, isLoadingData } = useOrderData();
  const { toast } = useToast();
  const [activeTrackers, setActiveTrackers] = useState<Record<string, boolean>>({});
  const watchIdRefs = useRef<Record<string, number | null>>({});
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({}); // To disable buttons during async operations


  const handleLocationSuccess = (order: Order, position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    updateOrderLocation(order.id, { lat: latitude, lng: longitude });
  };

  const handleLocationError = (orderId: string, error: GeolocationPositionError) => {
    console.error(`Geolocation error for order ${orderId}:`, error);
    let message = "Could not retrieve location.";
    if (error.code === error.PERMISSION_DENIED) {
      message = "Location access denied. Please enable location services to track.";
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      message = "Location information is unavailable.";
    } else if (error.code === error.TIMEOUT) {
      message = "Location request timed out.";
    }
    toast({
      title: "Location Error",
      description: message,
      variant: "destructive",
      duration: 7000,
    });
    if (watchIdRefs.current[orderId]) {
      navigator.geolocation.clearWatch(watchIdRefs.current[orderId]!);
      watchIdRefs.current[orderId] = null;
    }
    setActiveTrackers(prev => ({ ...prev, [orderId]: false }));
    setActionInProgress(prev => ({ ...prev, [orderId]: false }));
  };

  const startLiveTracking = async (order: Order) => {
    setActionInProgress(prev => ({ ...prev, [order.id]: true }));

    if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", description: "Your browser does not support geolocation.", variant: "destructive" });
      setActionInProgress(prev => ({ ...prev, [order.id]: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast({ title: "Location Access Granted", description: `Starting live tracking for order #${order.id.slice(0,8)}.`, duration: 4000 });
        
        if (order.status === 'Assigned') {
          await updateOrderStatus(order.id, 'Out for Delivery');
        }
        
        // Use the potentially updated order from context for the first location update
        const potentiallyUpdatedOrderAfterStatusChange = getOrderById(order.id) || order;
        handleLocationSuccess(potentiallyUpdatedOrderAfterStatusChange, position); 

        const watchId = navigator.geolocation.watchPosition(
          (newPosition) => {
            const latestOrder = getOrderById(order.id) || order; // Get latest order state
            handleLocationSuccess(latestOrder, newPosition);
          },
          (error) => handleLocationError(order.id, error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        watchIdRefs.current[order.id] = watchId;
        setActiveTrackers(prev => ({ ...prev, [order.id]: true }));
        setActionInProgress(prev => ({ ...prev, [order.id]: false }));
      },
      (error) => {
        handleLocationError(order.id, error);
        // setActionInProgress is handled by handleLocationError
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const pauseLiveTracking = (orderId: string) => {
    if (watchIdRefs.current[orderId]) {
      navigator.geolocation.clearWatch(watchIdRefs.current[orderId]!);
      watchIdRefs.current[orderId] = null;
    }
    setActiveTrackers(prev => ({ ...prev, [orderId]: false }));
    toast({ title: "Live Tracking Paused", description: `Location updates for order #${orderId.slice(0,8)} paused.`});
  };
  
  const handleMarkDelivered = async (orderId: string) => {
    setActionInProgress(prev => ({ ...prev, [orderId]: true }));
    if (watchIdRefs.current[orderId]) { 
      navigator.geolocation.clearWatch(watchIdRefs.current[orderId]!);
      watchIdRefs.current[orderId] = null;
    }
    await updateOrderStatus(orderId, 'Delivered');
    setActiveTrackers(prev => ({ ...prev, [orderId]: false })); 
    toast({ title: "Order Delivered!", description: `Order #${orderId.slice(0,8)} marked as delivered.`, variant: "default" });
    setActionInProgress(prev => ({ ...prev, [orderId]: false }));
  };

  useEffect(() => {
    // Cleanup all watchers when component unmounts
    return () => {
      Object.values(watchIdRefs.current).forEach(watchId => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      });
    };
  }, []); 
  
  const getStatusBadgeInfo = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return { class: 'bg-orange-500/90 border-orange-600 text-white hover:bg-orange-600/90', icon: <List size={14}/>, text: 'Pending' };
      case 'Assigned': return { class: 'bg-blue-500/90 border-blue-600 text-white hover:bg-blue-600/90', icon: <Truck size={14}/>, text: 'Assigned' };
      case 'Out for Delivery': return { class: 'bg-yellow-400/90 border-yellow-500 text-yellow-900 hover:bg-yellow-500/90', icon: <Navigation size={14}/>, text: 'Out for Delivery' };
      case 'Delivered': return { class: 'bg-green-500/90 border-green-600 text-white hover:bg-green-600/90', icon: <CheckCircle size={14}/>, text: 'Delivered' };
      default: return { class: 'bg-gray-400/90 border-gray-500 text-white hover:bg-gray-500/90', icon: <Info size={14}/>, text: 'Unknown' };
    }
  };

  useEffect(() => {
    orders.forEach(order => {
      const isTrackingThisOrder = activeTrackers[order.id];
      const latestOrderFromContext = getOrderById(order.id); // Get the most up-to-date order from context
      if (latestOrderFromContext && isTrackingThisOrder && latestOrderFromContext.status !== 'Out for Delivery') {
          pauseLiveTracking(latestOrderFromContext.id); 
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, activeTrackers, getOrderById]); 


  if (isLoadingData && orders.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <SkeletonOrderCard key={index} />
        ))}
      </div>
    );
  }

  if (orders.length === 0 && !isLoadingData) {
    return (
        <Alert className="max-w-xl mx-auto shadow-md animate-in fade-in-0 duration-500">
            <Truck className="h-5 w-5" />
            <AlertTitle className="font-semibold">No Deliveries Yet!</AlertTitle>
            <AlertDescription>
            You currently have no orders assigned to you. Check back later for new assignments.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {orders.map((order, index) => {
        const isTracking = activeTrackers[order.id] ?? false;
        const displayOrder = getOrderById(order.id) || order; 
        const statusInfo = getStatusBadgeInfo(displayOrder.status);
        const isActionRunningForThisOrder = actionInProgress[displayOrder.id] ?? false;

        return (
          <Card 
            key={displayOrder.id} 
            className="shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in-0 zoom-in-95"
            style={{animationDelay: `${index * 50}ms`}}
          >
            <CardHeader className="bg-card border-b">
               <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl font-semibold text-primary">Order #{displayOrder.id.slice(0,8)}</CardTitle>
                  <Badge variant="outline" className={`${statusInfo.class} text-xs px-2.5 py-1.5 font-medium flex items-center gap-1.5 transition-colors`}>
                    {statusInfo.icon}
                    {statusInfo.text}
                    {isTracking && <LocateFixed size={14} className="ml-1 animate-pulse text-white" />}
                  </Badge>
               </div>
               <CardDescription className="flex items-center gap-2 pt-1 text-sm">
                  <User size={16} className="text-muted-foreground"/> {displayOrder.customer_name}
               </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 flex-grow">
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0"/>
                <span className="font-medium">{displayOrder.delivery_address}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Package size={18} className="text-muted-foreground mt-0.5 shrink-0"/>
                <span className="text-muted-foreground">
                    Items: {displayOrder.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'No items listed'}
                </span>
              </div>
               {(displayOrder.status === 'Out for Delivery' || (displayOrder.status === 'Assigned' && isTracking)) && (displayOrder.current_location_lat && displayOrder.current_location_lng) && (
                <div className="flex items-center gap-3 text-sm pt-1">
                  <LocateFixed size={18} className="text-accent shrink-0"/>
                  <span className="font-mono text-xs">Lat: {displayOrder.current_location_lat.toFixed(4)}, Lng: {displayOrder.current_location_lng.toFixed(4)}</span>
                </div>
              )}
            </CardContent>
            <Separator/>
            <CardFooter className="pt-4 pb-4 bg-muted/50">
              {displayOrder.status === 'Assigned' && (
                <Button 
                  onClick={() => startLiveTracking(displayOrder)} 
                  className="w-full text-base py-3 hover:bg-primary/80 transition-colors" 
                  size="lg"
                  disabled={isActionRunningForThisOrder}
                >
                  {isActionRunningForThisOrder ? <Loader2 className="animate-spin mr-2"/> : <Navigation size={20} className="mr-2"/>}
                  {isActionRunningForThisOrder ? 'Starting...' : 'Start Delivery & Track Live'}
                </Button>
              )}
              {displayOrder.status === 'Out for Delivery' && (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button 
                    onClick={() => {
                      if (isTracking) pauseLiveTracking(displayOrder.id);
                      else startLiveTracking(displayOrder); 
                    }} 
                    variant={isTracking ? "outline" : "default"} 
                    className="flex-1 text-base py-3 transition-colors"
                    size="lg"
                    disabled={isActionRunningForThisOrder && !isTracking} 
                  >
                    {isActionRunningForThisOrder && !isTracking ? <Loader2 className="animate-spin mr-2"/> : (isTracking ? <Ban size={20} className="mr-2"/> : <Navigation size={20} className="mr-2"/>)}
                    {isActionRunningForThisOrder && !isTracking ? 'Starting...' : (isTracking ? 'Pause Live Tracking' : 'Resume Live Tracking')}
                  </Button>
                  <Button 
                    onClick={() => handleMarkDelivered(displayOrder.id)} 
                    variant="secondary" 
                    className="flex-1 text-base py-3 bg-green-500 hover:bg-green-600 text-white transition-colors"
                    size="lg"
                    disabled={isActionRunningForThisOrder}
                  >
                    {isActionRunningForThisOrder ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle size={20} className="mr-2"/>}
                     {isActionRunningForThisOrder ? 'Updating...' : 'Mark as Delivered'}
                  </Button>
                </div>
              )}
              {displayOrder.status === 'Delivered' && (
                <p className="text-sm text-green-600 font-semibold flex items-center gap-2 w-full justify-center">
                  <Truck size={18} className="mr-1"/> This order has been successfully delivered.
                </p>
              )}
               {displayOrder.status === 'Pending' && ( 
                <p className="text-sm text-orange-600 font-medium flex items-center gap-1.5 w-full justify-center">
                    <Clock size={16} className="mr-1"/> Order is pending assignment by vendor.
                </p>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}


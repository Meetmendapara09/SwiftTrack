
"use client";
import type { Order, Vendor, DeliveryPartner } from '@/lib/types'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, User, MapPin, ListOrdered, Clock, Truck, Store, Timer, UserCircle, Navigation, CheckCircle, Info, Home } from 'lucide-react';
import { useOrderData } from '@/hooks/useOrderData'; 
import { Separator } from '../ui/separator';

interface OrderStatusDetailsProps {
  order: Order;
}

export function OrderStatusDetails({ order }: OrderStatusDetailsProps) {
  const { vendors, deliveryPartners } = useOrderData();

  const vendor = order.vendor_id ? vendors.find(v => v.id === order.vendor_id) : null;
  const deliveryPartner = order.assigned_to_id ? deliveryPartners.find(dp => dp.id === order.assigned_to_id) : null;

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return { color: 'bg-orange-500/90 border-orange-600 text-white', icon: <Clock size={16} className="mr-2"/>, text: 'Pending Confirmation' };
      case 'Assigned': return { color: 'bg-blue-500/90 border-blue-600 text-white', icon: <Truck size={16} className="mr-2"/>, text: 'Preparing for Dispatch' };
      case 'Out for Delivery': return { color: 'bg-yellow-400/90 border-yellow-500 text-yellow-900', icon: <Navigation size={16} className="mr-2"/>, text: 'Out for Delivery' };
      case 'Delivered': return { color: 'bg-green-500/90 border-green-600 text-white', icon: <CheckCircle size={16} className="mr-2"/>, text: 'Delivered Successfully' };
      default: return { color: 'bg-gray-500/90 border-gray-600 text-white', icon: <Info size={16} className="mr-2"/>, text: 'Status Unknown' };
    }
  };
  const statusInfo = getStatusInfo(order.status);

  const getEstimatedDeliveryTime = (status: Order['status']) => {
    if (status === 'Delivered') return 'Delivered';
    if (status === 'Out for Delivery') return 'Expected in 15-45 minutes';
    if (status === 'Assigned') return 'Expected today, preparing for dispatch';
    return 'Processing, awaiting confirmation';
  };
  const estimatedDelivery = getEstimatedDeliveryTime(order.status);

  return (
    <Card className="w-full shadow-xl animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-2xl font-semibold text-primary">Order #{order.id.slice(0,8)}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1 text-base">
              <User size={18} className="text-muted-foreground"/> For {order.customer_name}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`${statusInfo.color} text-sm px-4 py-2 font-medium flex items-center self-start sm:self-center`}>
            {statusInfo.icon}
            {statusInfo.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        
        <div className="flex items-start">
          <MapPin size={24} className="text-muted-foreground mr-4 mt-1 shrink-0"/>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-0.5">Delivery Address</h3>
            <p className="text-base font-medium">{order.delivery_address}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <ListOrdered size={24} className="text-muted-foreground mr-4 mt-1 shrink-0"/>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-0.5">Items in Order</h3>
            <ul className="list-disc list-inside pl-1 space-y-0.5">
              {order.items?.map(item => (
                <li key={item.id} className="text-base">
                  {item.name} (Qty: {item.quantity})
                </li>
              )) || <li className="text-base text-muted-foreground">No items listed.</li>}
            </ul>
          </div>
        </div>

        {vendor && (
          <div className="flex items-start">
            <Store size={24} className="text-muted-foreground mr-4 mt-1 shrink-0"/>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-0.5">Sold by</h3>
              <p className="text-base">{vendor.name}</p>
            </div>
          </div>
        )}

        {deliveryPartner && (
          <div className="flex items-start">
            <UserCircle size={24} className="text-muted-foreground mr-4 mt-1 shrink-0"/>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-0.5">Delivery Partner</h3>
              <p className="text-base">{deliveryPartner.name}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start">
          <Timer size={24} className="text-muted-foreground mr-4 mt-1 shrink-0"/>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-0.5">Estimated Delivery</h3>
            <p className="text-base font-semibold text-accent">{estimatedDelivery}</p>
          </div>
        </div>

        {order.status === 'Out for Delivery' && order.current_location_lat && order.current_location_lng && (
           <div className="flex items-start">
             <div className="w-6 mr-4 shrink-0"></div> 
             <div className="border-l-2 border-dashed border-primary/50 pl-6 ml-3 py-1 relative before:content-[''] before:absolute before:-left-[5px] before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-primary before:rounded-full">
                <h3 className="text-sm font-medium text-muted-foreground -mt-1 mb-0.5">Current Location (approx.)</h3>
                <p className="text-sm font-mono text-foreground">Lat: {order.current_location_lat.toFixed(4)}, Lng: {order.current_location_lng.toFixed(4)}</p>
             </div>
           </div>
        )}
      </CardContent>
       {(order.status !== 'Pending' && order.status !== 'Assigned') && (
        <>
          <Separator />
          <CardFooter className="pt-4 pb-4 bg-muted/50">
            <p className="text-xs text-muted-foreground text-center w-full">
              { order.status === 'Out for Delivery' ? "Your order is on its way! Track its progress on the map." : "Your order has been delivered. Thank you for using SwiftTrack!" }
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

    
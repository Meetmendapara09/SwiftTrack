
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import type { Order, OrderItem, OrderStatus, DbOrder, DbOrderItem } from '@/lib/types';

function getSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from environment variables.');
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
             console.warn(`Failed to set cookie "${name}" in Server Action:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.warn(`Failed to remove cookie "${name}" in Server Action:`, error);
          }
        }
      }
    }
  );
}

async function getOrderWithItems(orderId: string): Promise<Order | null> {
  const supabase = getSupabaseClient();
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !orderData) {
    console.error(`Error fetching order ${orderId}:`, orderError?.message);
    return null;
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error(`Error fetching items for order ${orderId}:`, itemsError?.message);
     return {
      ...(orderData as DbOrder),
      status: orderData.status as OrderStatus,
      items: [],
    } as Order;
  }
  
  const orderWithItems: Order = {
    ...(orderData as DbOrder),
    status: orderData.status as OrderStatus,
    items: (itemsData || []).map(item => ({...item} as DbOrderItem as OrderItem)),
  };
  return orderWithItems;
}


export async function assignDeliveryPartnerAction(
  orderId: string,
  partnerId: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const supabase = getSupabaseClient();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: 'User not authenticated for assigning partner.' };
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ assigned_to_id: partnerId, status: 'Assigned' })
      .eq('id', orderId)
      .select() 
      .single(); 

    if (updateError) {
      console.error('Error in assignDeliveryPartnerAction (update):', updateError);
      return { success: false, error: updateError.message };
    }

    const updatedOrder = await getOrderWithItems(orderId);
    if (!updatedOrder) {
        return { success: false, error: 'Failed to retrieve updated order details.' };
    }

    return { success: true, order: updatedOrder };
  } catch (e) {
    console.error('Error in assignDeliveryPartnerAction (catch):', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const supabase = getSupabaseClient();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: 'User not authenticated for updating status.' };
    }
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error in updateOrderStatusAction (update):', updateError);
      return { success: false, error: updateError.message };
    }
    
    const updatedOrder = await getOrderWithItems(orderId);
     if (!updatedOrder) {
        return { success: false, error: 'Failed to retrieve updated order details after status update.' };
    }

    return { success: true, order: updatedOrder };
  } catch (e) {
    console.error('Error in updateOrderStatusAction (catch):', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function updateOrderLocationAction(
  orderId: string,
  location: { lat: number; lng: number }
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const supabase = getSupabaseClient();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: 'User not authenticated for updating location.' };
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ current_location_lat: location.lat, current_location_lng: location.lng })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error in updateOrderLocationAction (update):', updateError);
      return { success: false, error: updateError.message };
    }

    const updatedOrder = await getOrderWithItems(orderId);
    if (!updatedOrder) {
      return { success: false, error: 'Failed to retrieve updated order details after location update.' };
    }
    
    return { success: true, order: updatedOrder };
  } catch (e) {
    console.error('Error in updateOrderLocationAction (catch):', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

interface CreateOrderActionInput {
  customer_name: string;
  customer_email?: string | null;
  delivery_address: string;
  vendor_id: string; 
  items: Array<{ name: string; quantity: number }>;
}

export async function createOrderAction(
  input: CreateOrderActionInput
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const supabase = getSupabaseClient();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: 'User not authenticated for creating order.' };
    }
    
    const { data: newOrderData, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        delivery_address: input.delivery_address,
        vendor_id: input.vendor_id, // This is the vendors.id (UUID)
        status: 'Pending', 
      })
      .select()
      .single();

    if (orderInsertError || !newOrderData) {
      console.error('Error in createOrderAction (insert order):', orderInsertError);
      return { success: false, error: orderInsertError?.message || "Failed to insert order." };
    }

    const newOrderId = newOrderData.id;

    if (input.items && input.items.length > 0) {
      const itemsToInsert = input.items.map(item => ({
        order_id: newOrderId,
        name: item.name,
        quantity: item.quantity,
      }));

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsInsertError) {
        console.error('Error in createOrderAction (insert items):', itemsInsertError);
        return { success: false, error: `Order created, but failed to insert items: ${itemsInsertError.message}` };
      }
    }

    const createdOrderWithItems = await getOrderWithItems(newOrderId);
    if (!createdOrderWithItems) {
      return { success: false, error: 'Order created, but failed to retrieve complete details.' };
    }

    return { success: true, order: createdOrderWithItems };

  } catch (e) {
    console.error('Error in createOrderAction (catch):', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during order creation';
    return { success: false, error: errorMessage };
  }
}

// Fetches orders based on the authenticated user's role
export async function getOrdersAction(): Promise<Order[]> {
  const supabase = getSupabaseClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    console.error('Error fetching authenticated user or no user session:', authError?.message);
    return []; 
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user profile or profile not found:', profileError?.message);
    return [];
  }

  let query = supabase.from('orders').select(`
    id,
    customer_name,
    customer_email,
    delivery_address,
    status,
    vendor_id,
    assigned_to_id,
    current_location_lat,
    current_location_lng,
    created_at,
    updated_at,
    order_items (
      id,
      order_id,
      name,
      quantity,
      created_at
    )
  `);

  if (profile.role === 'vendor') {
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', authUser.id)
      .single();
    if (vendorError || !vendorData) {
      console.warn(`No vendor entity found for user ${authUser.id}, cannot fetch vendor-specific orders.`);
      return [];
    }
    query = query.eq('vendor_id', vendorData.id);
  } else if (profile.role === 'delivery_partner') {
    const { data: partnerData, error: partnerError } = await supabase
      .from('delivery_partners')
      .select('id')
      .eq('user_id', authUser.id)
      .single();
    if (partnerError || !partnerData) {
      console.warn(`No delivery partner entity found for user ${authUser.id}, cannot fetch partner-specific orders.`);
      return [];
    }
    query = query.eq('assigned_to_id', partnerData.id);
  } else {
      console.log(`User role '${profile.role}' does not have a list view in getOrdersAction.`);
    return [];
  }

  const { data, error: ordersError } = await query.order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error in getOrdersAction while fetching orders:', ordersError.message);
    return [];
  }

  return (data || []).map(order => ({
      ...(order as DbOrder),
      status: order.status as OrderStatus, 
      items: (order.order_items || []).map(item => ({...item} as DbOrderItem as OrderItem)),
  })) as Order[];
}

import { NextResponse } from 'next/server';
import { mockOrders } from '@/lib/data'; // Assuming mockOrders can be imported server-side

export async function GET() {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    return NextResponse.json(mockOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 });
  }
}


"use client";
import { useContext } from 'react';
import { OrderDataContext } from '@/contexts/OrderDataContext';

export const useOrderData = () => {
  const context = useContext(OrderDataContext);
  if (context === undefined) {
    throw new Error('useOrderData must be used within an OrderDataProvider');
  }
  return context;
};

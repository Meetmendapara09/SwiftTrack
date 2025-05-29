
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function VendorErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Vendor Section Error:",error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-4 animate-in fade-in-0 duration-500">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h2 className="text-3xl font-semibold mb-3">Vendor Section Error</h2>
      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        {error.message || "An unexpected error occurred in the vendor section. Please try again."}
      </p>
      <Button onClick={() => reset()} variant="default" size="lg">
        Try again
      </Button>
    </div>
  );
}

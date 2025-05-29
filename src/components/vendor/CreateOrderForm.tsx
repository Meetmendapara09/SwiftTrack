
"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import type { OrderItem } from '@/lib/types';

const orderItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const createOrderFormSchema = z.object({
  customer_name: z.string().min(2, "Customer name is required (min 2 chars)"),
  customer_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  delivery_address: z.string().min(5, "Delivery address is required (min 5 chars)"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export type CreateOrderFormValues = z.infer<typeof createOrderFormSchema>;

interface CreateOrderFormProps {
  onSubmit: (values: CreateOrderFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
}

export function CreateOrderForm({ onSubmit, onOpenChange, isSubmitting }: CreateOrderFormProps) {
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      delivery_address: "",
      items: [{ name: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleFormSubmit = async (values: CreateOrderFormValues) => {
    await onSubmit(values);
    // Dialog closing is handled by parent if submission is successful
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Email (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="delivery_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label className="text-md font-medium">Order Items</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3 p-3 border rounded-md bg-muted/50">
              <FormField
                control={form.control}
                name={`items.${index}.name`}
                render={({ field: itemField }) => (
                  <FormItem className="flex-grow">
                    <FormLabel htmlFor={`items.${index}.name`} className="text-xs">Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pizza" {...itemField} id={`items.${index}.name`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field: itemField }) => (
                  <FormItem className="w-24">
                    <FormLabel htmlFor={`items.${index}.quantity`} className="text-xs">Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...itemField} id={`items.${index}.quantity`} min="1"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", quantity: 1 })}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
          {form.formState.errors.items && typeof form.formState.errors.items === 'string' && (
             <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
          )}
           {form.formState.errors.items && !form.formState.errors.items.message && typeof form.formState.errors.items !== 'string' && (
             <p className="text-sm font-medium text-destructive">Please add at least one item and fill its details.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
           <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { KeyRound, LogIn, Store } from "lucide-react";

const loginSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeCode: z.string().min(1, "Store code is required"),
});
export type RetailerLoginCredentials = z.infer<typeof loginSchema>;

interface RetailerLoginProps {
  onLogin: (credentials: RetailerLoginCredentials) => void;
}

export function RetailerLogin({ onLogin }: RetailerLoginProps) {
  const form = useForm<RetailerLoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { storeName: "retail", storeCode: "5678" },
  });

  const onSubmit: SubmitHandler<RetailerLoginCredentials> = (data) => {
    onLogin(data);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Store className="mr-2" /> Retailer Login
          </CardTitle>
          <CardDescription>Enter your credentials to access the retailer dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., retail" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="e.g., 5678" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">
                <LogIn className="mr-2" /> Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

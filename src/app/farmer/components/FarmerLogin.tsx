"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { KeyRound, LogIn, User, Building } from "lucide-react";

const loginSchema = z.object({
  mandiName: z.string().min(1, "Mandi name is required"),
  officerName: z.string().min(1, "Officer name is required"),
  code: z.string().min(1, "Code is required"),
});
export type FarmerLoginCredentials = z.infer<typeof loginSchema>;

interface FarmerLoginProps {
  onLogin: (credentials: FarmerLoginCredentials) => void;
}

export function FarmerLogin({ onLogin }: FarmerLoginProps) {
  const form = useForm<FarmerLoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mandiName: "", officerName: "", code: "" },
  });

  const onSubmit: SubmitHandler<FarmerLoginCredentials> = (data) => {
    onLogin(data);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <User className="mr-2" /> Farmer / Sahayak Login
          </CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="mandiName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mandi Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., apmc" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="officerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Officer Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., officer1" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="e.g., 7890" {...field} className="pl-10" />
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

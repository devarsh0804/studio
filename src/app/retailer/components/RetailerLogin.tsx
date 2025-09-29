
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { KeyRound, LogIn, Store, UserPlus, Mail, Phone } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useState } from "react";

const registerSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be a 10-digit number."),
  storeCode: z.string().min(4, "Code must be at least 4 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  storeCode: z.string().min(4, "Code must be at least 4 characters"),
  storeName: z.string().optional(),
  mobile: z.string().optional(),
});

export type RetailerRegisterCredentials = z.infer<typeof registerSchema>;
export type RetailerLoginCredentials = z.infer<typeof loginSchema>;


interface RetailerLoginProps {
  onLogin: (credentials: RetailerLoginCredentials) => Promise<void>;
  onRegister: (credentials: RetailerRegisterCredentials) => Promise<boolean>;
}

export function RetailerLogin({ onLogin, onRegister }: RetailerLoginProps) {
  const { t } = useLocale();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const form = useForm<RetailerLoginCredentials | RetailerRegisterCredentials>({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
    defaultValues: { storeName: "", email: "", mobile: "", storeCode: "" },
  });

  const onSubmit: SubmitHandler<RetailerLoginCredentials | RetailerRegisterCredentials> = async (data) => {
    if (isRegistering) {
      const success = await onRegister(data as RetailerRegisterCredentials);
      if (success) {
        setIsRegistering(false); // Switch back to login
        form.reset();
      }
    } else {
      await onLogin(data as RetailerLoginCredentials);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Store className="mr-2" /> {isRegistering ? "Register New Store" : t('retailerLogin.title')}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? "Create a new retailer account for your store."
              : t('retailerLogin.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isRegistering && (
                <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('retailerLogin.nameLabel')}</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t('retailerLogin.namePlaceholder')} {...field} className="pl-10" />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="e.g., user@example.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isRegistering && (
                <>
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., 9876543210" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="storeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('retailerLogin.codeLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder={isRegistering ? "Create a 4-digit access code" : t('retailerLogin.codePlaceholder')} {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">
                {isRegistering ? <><UserPlus className="mr-2" /> Register</> : <><LogIn className="mr-2" /> {t('login.login')}</>}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center text-sm">
                {isRegistering ? "Already have an account?" : t('login.dontHaveAccount')}{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Login" : t('login.register')}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

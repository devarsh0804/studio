
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { KeyRound, LogIn, User, CircleUserRound, UserPlus, Mail, Phone } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useState } from "react";

const registerSchema = z.object({
  farmerName: z.string().min(1, "Farmer name is required"),
  farmerId: z.string().regex(/^\d{12}$/, "Farmer ID must be a 12-digit number."),
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be a 10-digit number."),
  farmerCode: z.string().min(4, "Code must be at least 4 characters."),
});

const loginSchema = z.object({
  farmerName: z.string().min(1, "Farmer name is required"),
  farmerId: z.string().optional(), // Optional for login
  email: z.string().optional(),
  mobile: z.string().optional(),
  farmerCode: z.string().min(4, "Code must be at least 4 characters."),
});

export type FarmerLoginCredentials = z.infer<typeof loginSchema>;
export type FarmerRegisterCredentials = z.infer<typeof registerSchema>;

interface FarmerLoginProps {
  onLogin: (credentials: FarmerLoginCredentials) => Promise<void>;
  onRegister: (credentials: FarmerRegisterCredentials) => Promise<boolean>;
}

export function FarmerLogin({ onLogin, onRegister }: FarmerLoginProps) {
  const { t } = useLocale();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const form = useForm<FarmerLoginCredentials | FarmerRegisterCredentials>({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
    defaultValues: { farmerName: "", farmerId: "", email: "", mobile: "", farmerCode: "" },
  });

  const onSubmit: SubmitHandler<FarmerLoginCredentials | FarmerRegisterCredentials> = async (data) => {
    if (isRegistering) {
      const success = await onRegister(data as FarmerRegisterCredentials);
      if (success) {
        setIsRegistering(false); // Switch back to login after successful registration
        form.reset();
      }
    } else {
      await onLogin(data as FarmerLoginCredentials);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <User className="mr-2" /> {isRegistering ? "Register as Farmer" : t('farmerLogin.title')}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? "Create a new farmer account to get started."
              : t('farmerLogin.description')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="farmerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('farmerLogin.nameLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={t('farmerLogin.namePlaceholder')} {...field} className="pl-10" />
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
                    name="farmerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('farmerLogin.idLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t('farmerLogin.idPlaceholder')} {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                name="farmerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('farmerLogin.codeLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder={isRegistering ? "Create a 4-digit access code" : t('farmerLogin.codePlaceholder')} {...field} className="pl-10" />
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
                <Button variant="link" className="p-0 h-auto" onClick={() => {
                    setIsRegistering(!isRegistering);
                    form.reset();
                }}>
                    {isRegistering ? "Login" : t('login.register')}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import React from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/app/utils/supabase/client";
import { Krona_One } from 'next/font/google';

const krona = Krona_One({
  subsets: ['latin'],
  weight: '400',
});

const BRANCH_OPTIONS = {
  cs: "Computer Science",
  cs_aiml: "CS (AI & ML)",
  cs_regional: "CS (Regional)",
  it: "Information Technology",
  entc: "Electronics & Telecomm.",
  mech: "Mechanical",
  civil: "Civil"
} as const;

const COLLEGE_OPTIONS = {
    pccoe: "Pimpri Chinchwad College of Engineering, Pune",
    pccoer: "Pimpri Chinchwad College of Engineering & Research, Ravet",
    pcu: "Pimpri Chinchwad University",
    nutan: "Nutan Maharashtra Institute of Engineering & Technology, Pune",
    nmit: "Nutan College of Engineering & Research (NCER)",
    ait: "Army Institute of Technology",
    aissms: "All India Shri Shivaji Memorial Society's College of Engineering",
    bvp: "Bharati Vidyapeeth College of Engineering",
    coep: "College of Engineering Pune",
    cummins: "Cummins College of Engineering",
    dyp: "Dr. D.Y. Patil Institute of Technology, Akurdi",
    iiit: "Indian Institute of Information Technology, Pune",
    jspm: "JSPM's Rajarshi Shahu College of Engineering",
    mit: "MIT World Peace University (MIT-WPU)",
    mit_adt: "MIT Art, Design and Technology University",
    pict: "SCTR'S Pune Institute of Computer Technology",
    pvg: "PVG's College of Engineering and Technology",
    scoe: "Sinhgad College of Engineering",
    sit_lavle: "Symbiosis Institute of Technology, Lavle",
    viit: "BRACT's, Vishwakarma Institute of Information Technology",
    vit: "Vishwakarma Institute of Technology",
  } as const;
  

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  college_name: z.string().min(2, "College name is required"),
  prn: z.string().min(2, "PRN is required"),
  branch: z.string().min(2, "Branch is required"),
  class: z.string().min(1, "Class is required"),
  gender: z.string().min(1, "Gender is required"),
});

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOtherBranch, setIsOtherBranch] = React.useState(false);
  const [isOtherClass, setIsOtherClass] = React.useState(false);
  const [isOtherCollege, setIsOtherCollege] = React.useState(false);
  const [showVerification, setShowVerification] = React.useState(false);
  const [token, setToken] = React.useState("");
  const [cooldown, setCooldown] = React.useState(0);
  const [formData, setFormData] = React.useState<any>(null);

  // Add cooldown effect
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      college_name: "",
      prn: "",
      branch: "",
      class: "",
      gender: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          data: {
            full_name: values.full_name,
            phone: values.phone,
            college_name: values.college_name,
            prn: values.prn,
            branch: values.branch,
            class: values.class,
            gender: values.gender,
          }
        }
      });

      if (error) throw error;
      
      // Store form data for later use after verification
      setFormData(values);
      setShowVerification(true);
      setCooldown(60);
      toast.success("Verification code sent!", {
        description: "Please check your email",
      });
      
    } catch (error: any) {
      toast.error("Failed to send verification code", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (token.length !== 6 || !formData) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token,
        type: 'email',
      });

      if (error) throw error;

      if (data?.session) {
        // Create profile after successful verification
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.session.user.id,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            college_name: formData.college_name,
            prn: formData.prn,
            branch: formData.branch,
            class: formData.class,
            gender: formData.gender,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;
        
        toast.success("Account created successfully!");
        router.push('/dashboard');
        router.refresh();
        return;
      }

      throw new Error('Verification failed');
    } catch (error: any) {
      toast.error("Verification failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (showVerification) {
    return (
      <form onSubmit={verifyOTP} className="space-y-6">
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
          <p className="font-medium">Check your inbox!</p>
          <p className="text-sm mt-1">We&apos;ve sent a code to {formData?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Verification Code
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={token}
              onChange={(value) => setToken(value)}
              className="gap-2 sm:gap-3"
            >
              <InputOTPGroup>
                <InputOTPSlot 
                  index={0} 
                  className="border-gray-500 bg-white text-gray-900 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={1} 
                  className="border-gray-500 bg-white text-gray-900 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={2} 
                  className="border-gray-500 bg-white text-gray-900 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={3} 
                  className="border-gray-500 bg-white text-gray-900 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={4} 
                  className="border-gray-500 bg-white text-gray-900 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={5} 
                  className="border-gray-500 bg-white text-gray-900 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={isLoading || token.length !== 6}
        >
          {isLoading ? "Verifying..." : "Create Account"}
        </Button>

        <div className="flex flex-col gap-2 text-center">
          <button
            type="button"
            onClick={() => setShowVerification(false)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Use a different email
          </button>
          <button
            type="button"
            onClick={() => onSubmit(formData)}
            disabled={isLoading || cooldown > 0}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-[2rem]">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
        {/* Ticket effect dots */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

        <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50">
          <div className={`${krona.className} text-center mb-8`}>
            <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-medium tracking-wide uppercase mb-3">
              Create Your Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome to Spectrum&apos;25</h1>
            <p className="text-sm text-gray-600">Join the innovation journey</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Update all FormField components with consistent styling */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">Email Address</FormLabel>
                        <p className="text-xs text-gray-500">you@example.com</p>
                      </div>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Update all other FormFields with similar styling */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">Full Name</FormLabel>
                        <p className="text-xs text-gray-500">eg. John Doe</p>
                      </div>
                      <FormControl>
                        <Input {...field} className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors" />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">Phone</FormLabel>
                        <p className="text-xs text-gray-500">eg. 9876543210</p>
                      </div>
                      <FormControl>
                        <Input {...field} className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors" />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">Gender</FormLabel>
                        <p className="text-xs text-gray-500">Select your gender</p>
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-500 transition-colors">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="college_name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">College Name</FormLabel>
                      </div>
                      <div className="space-y-3">
                        <Select 
                          onValueChange={(value) => {
                            if (value === "_other") {
                              setIsOtherCollege(true);
                              return;
                            }
                            setIsOtherCollege(false);
                            field.onChange(COLLEGE_OPTIONS[value as keyof typeof COLLEGE_OPTIONS]);
                          }}
                          // Remove the default "other" value by checking for existing value first
                          value={isOtherCollege ? "_other" : Object.entries(COLLEGE_OPTIONS).find(([_, label]) => label === field.value)?.[0]}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-500 transition-colors">
                              <SelectValue placeholder="Select college" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="max-h-[300px] overflow-y-auto">
                              {Object.entries(COLLEGE_OPTIONS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                              <SelectItem value="_other">Other</SelectItem>
                            </div>
                          </SelectContent>
                        </Select>

                        {isOtherCollege && (
                          <div className="space-y-2">
                            <FormControl>
                              <Input
                                placeholder="Enter your college name"
                                className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Please enter your complete college name</p>
                          </div>
                        )}
                      </div>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prn"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">PRN</FormLabel>
                        <p className="text-xs text-gray-500">eg. 123X1X00</p>
                      </div>
                      <FormControl>
                        <Input {...field} className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors" />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">Branch</FormLabel>
                      </div>
                      <div className="space-y-3">
                        <Select 
                          onValueChange={(value) => {
                            if (value === "_other") {
                              setIsOtherBranch(true);
                              // Keep the existing custom value if there is one
                              return;
                            }
                            setIsOtherBranch(false);
                            field.onChange(value);
                          }} 
                          value={isOtherBranch ? "_other" : field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-500 transition-colors">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(BRANCH_OPTIONS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                            <SelectItem value="_other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        {isOtherBranch && (
                          <div className="space-y-2">
                            <FormControl>
                              <Input
                                placeholder="Enter your branch name"
                                className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Please enter your complete branch name</p>
                          </div>
                        )}
                      </div>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-gray-900">Class/Division</FormLabel>
                      </div>
                      <div className="space-y-3">
                        <Select 
                          onValueChange={(value) => {
                            if (value === "_other") {
                              setIsOtherClass(true);
                              return;
                            }
                            setIsOtherClass(false);
                            field.onChange(value);
                          }}
                          value={isOtherClass ? "_other" : field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 bg-white border-gray-200 hover:border-blue-500 transition-colors">
                              <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from('ABCDEFGHIJKLMNOP').map((letter) => (
                              <SelectItem key={letter} value={letter}>
                                Division {letter}
                              </SelectItem>
                            ))}
                            <SelectItem value="_other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        {isOtherClass && (
                          <div className="space-y-2">
                            <FormControl>
                              <Input
                                placeholder="Enter your division"
                                className="h-10 text-gray-900 border-gray-200 bg-white hover:border-blue-500 transition-colors"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Please enter your complete division/class name</p>
                          </div>
                        )}
                      </div>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-dashed border-gray-200 pt-6 -mx-4 sm:-mx-6 md:-mx-8" />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending verification..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

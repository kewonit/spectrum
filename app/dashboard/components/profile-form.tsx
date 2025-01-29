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
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  college_name: z.string().min(2, "College name is required"),
  prn: z.string().min(2, "PRN is required"),
  branch: z.string().min(2, "Branch is required"),
  class: z.string().min(1, "Class is required"),
  gender: z.string(),
});

export function ProfileForm({ profile, onUpdate }: { profile: any; onUpdate: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      college_name: profile?.college_name || "",
      prn: profile?.prn || "",
      branch: profile?.branch || "",
      class: profile?.class || "",
      gender: profile?.gender || "",
    },
  });

  // Add state to track "other" selection
  const [isOtherBranch, setIsOtherBranch] = React.useState(!Object.keys(BRANCH_OPTIONS).includes(profile?.branch || ''));
  const [isOtherClass, setIsOtherClass] = React.useState(!(profile?.class || '').match(/^[A-Z]$/));
  const [isOtherCollege, setIsOtherCollege] = React.useState(!Object.keys(COLLEGE_OPTIONS).includes(profile?.college_name || ''));

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(
      async () => {
        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) throw new Error('Failed to update profile');
        onUpdate(); // Trigger refresh of profile data
      },
      {
        loading: 'Updating profile...',
        success: 'Profile updated successfully',
        error: 'Failed to update profile',
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-2 sm:p-4 rounded-[2rem]">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
          {/* Ticket effect dots */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

          <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Email display section - Updated */}
            <div className="bg-blue-50/70 px-3 py-2.5 sm:p-4 rounded-lg">
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-xs sm:text-sm font-medium text-blue-800">Email Address</label>
                <p className="text-sm sm:text-base font-medium text-blue-600">{profile?.email}</p>
                <p className="text-[10px] sm:text-xs text-blue-400">* Email cannot be changed</p>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-900">Full Name</FormLabel>
                      <p className="text-xs text-gray-500">eg. John Doe</p>
                    </div>
                    <FormControl>
                      <Input {...field} className="text-gray-900 border-gray-300" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-900">Phone</FormLabel>
                      <p className="text-xs text-gray-500">eg. 9876543210</p>
                    </div>
                    <FormControl>
                      <Input {...field} className="text-gray-900 border-gray-300" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-100">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="college_name"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-900">College Name</FormLabel>
                    <div className="space-y-3">
                      <Select 
                        onValueChange={(value) => {
                          if (value === "other") {
                            setIsOtherCollege(true);
                            return;
                          }
                          setIsOtherCollege(false);
                          field.onChange(COLLEGE_OPTIONS[value as keyof typeof COLLEGE_OPTIONS]);
                        }}
                        value={isOtherCollege ? "other" : Object.entries(COLLEGE_OPTIONS).find(([_, label]) => label === field.value)?.[0] || "other"}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-50">
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
                            <SelectItem value="other">Other</SelectItem>
                          </div>
                        </SelectContent>
                      </Select>

                      {isOtherCollege && (
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              placeholder="Enter your college name"
                              className="text-gray-900 border-gray-300"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Please enter your complete college name</p>
                        </div>
                      )}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prn"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-900">PRN</FormLabel>
                      <p className="text-xs text-gray-500">eg. 123X1X00</p>
                    </div>
                    <FormControl>
                      <Input {...field} className="text-gray-900 border-gray-300" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-900">Branch</FormLabel>
                    <div className="space-y-3">
                      <Select 
                        onValueChange={(value) => {
                          if (value === "other") {
                            setIsOtherBranch(true);
                            // Keep the existing custom value if there is one
                            return;
                          }
                          setIsOtherBranch(false);
                          field.onChange(value);
                        }} 
                        value={isOtherBranch ? "other" : field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-50">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(BRANCH_OPTIONS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {isOtherBranch && (
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              placeholder="Enter your branch name"
                              className="text-gray-900 border-gray-300"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Please enter your complete branch name</p>
                        </div>
                      )}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-900">Class/Division</FormLabel>
                    <div className="space-y-3">
                      <Select 
                        onValueChange={(value) => {
                          if (value === "other") {
                            setIsOtherClass(true);
                            return;
                          }
                          setIsOtherClass(false);
                          field.onChange(value);
                        }}
                        value={isOtherClass ? "other" : field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-50">
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from('ABCDEFGHIJKLMNOP').map((letter) => (
                            <SelectItem key={letter} value={letter}>
                              Division {letter}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {isOtherClass && (
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              placeholder="Enter your division"
                              className="text-gray-900 border-gray-300"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Please enter your complete division/class name</p>
                        </div>
                      )}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t-2 border-dashed border-gray-300 my-4 sm:my-6 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8"></div>

            <Button 
              type="submit" 
              className="w-full py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-300 rounded-lg flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
            >
              <span>Save Changes</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

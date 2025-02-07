'use client';

import { Input } from "@/components/ui/input";
import {
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
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";

export const BRANCH_OPTIONS = {
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

const isPccoeStudent = (collegeName: string, collegeKey: string | null): boolean => {
  // Normalize college name by removing spaces, special characters and converting to lowercase
  const normalizedCollegeName = collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Array of possible PCCOE variations
  const pccoeVariations = [
    'pccoe',
    'pimprichinchwadcollegeofengineeringpune',
    'pccoepune',
    'pimprichinchwadcollegeofengineering',
    'pccoepune'
  ];

  return (
    // Check if collegeKey matches
    collegeKey === 'pccoe' ||
    // Check if any variation matches the normalized college name
    pccoeVariations.some(variation => normalizedCollegeName.includes(variation))
  );
};

interface UserDetailsFormProps {
  form: UseFormReturn<any>;
  excludeFields?: string[];
}

export function UserDetailsForm({ form, excludeFields = [] }: UserDetailsFormProps) {
  // Initialize state with proper default values
  const [isOtherBranch, setIsOtherBranch] = useState(false);
  const [isOtherClass, setIsOtherClass] = useState(false);
  const [isOtherCollege, setIsOtherCollege] = useState(false);
  const [selectedCollegeKey, setSelectedCollegeKey] = useState<string | null>(null);

  // Initialize form values when component mounts
  useEffect(() => {
    const initialValues = {
      full_name: '',
      phone: '',
      college_name: '',
      prn: '',
      branch: '',
      class: '',
      gender: '',
    };

    Object.entries(initialValues).forEach(([field, value]) => {
      const currentValue = form.getValues(field);
      if (currentValue === undefined) {
        form.setValue(field, value, {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    });
  }, [form]);

  // Add effect to handle Select value initialization
  useEffect(() => {
    const collegeValue = form.getValues('college_name');
    const branchValue = form.getValues('branch');
    const classValue = form.getValues('class');

    // Set other flags based on initial values
    if (collegeValue && !Object.values(COLLEGE_OPTIONS).includes(collegeValue)) {
      setIsOtherCollege(true);
    }
    if (branchValue && !Object.values(BRANCH_OPTIONS).includes(branchValue)) {
      setIsOtherBranch(true);
    }
    if (classValue && !Array.from('ABCDEFGHIJKLMNOP').includes(classValue)) {
      setIsOtherClass(true);
    }
  }, [form]);

  const formItemClasses = "sm:col-span-2 lg:col-span-1";
  const inputClasses = "min-h-[2.5rem] sm:min-h-[2.75rem] text-base sm:text-lg";
  const labelClasses = "text-sm sm:text-base font-medium";
  const helperTextClasses = "text-xs sm:text-sm text-gray-500";

  const renderField = (fieldName: string) => {
    if (excludeFields.includes(fieldName)) return null;

    switch (fieldName) {
      case 'full_name':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="full_name"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={formItemClasses}>
                <FormLabel className={labelClasses}>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter your full name"
                    className={inputClasses}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'phone':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="phone"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={formItemClasses}>
                <FormLabel className={labelClasses}>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="10-digit phone number" className={inputClasses} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'college_name':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="college_name"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={`${formItemClasses} lg:col-span-2`}>
                <FormLabel className={labelClasses}>College Name</FormLabel>
                <div className="space-y-3">
                  <Select
                    value={isOtherCollege ? "_other" : Object.entries(COLLEGE_OPTIONS).find(([_, label]) => label === field.value)?.[0] || "_other"}
                    onValueChange={(value) => {
                      if (value === "_other") {
                        setIsOtherCollege(true);
                        setSelectedCollegeKey(null);
                        field.onChange('');
                      } else {
                        setIsOtherCollege(false);
                        setSelectedCollegeKey(value);
                        field.onChange(COLLEGE_OPTIONS[value as keyof typeof COLLEGE_OPTIONS] || '');
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      <div className="max-h-[250px] overflow-y-auto">
                        {Object.entries(COLLEGE_OPTIONS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
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
                          value={field.value || ''}
                          onChange={(e) => {
                            setSelectedCollegeKey(null);
                            const value = e.target.value.replace(/^\s+/g, ''); // Remove leading spaces only
                            field.onChange(value);
                            form.setValue("college_name", value, { 
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true
                            });
                          }}
                          className={inputClasses}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">Please enter your complete college name</p>
                    </div>
                  )}

                  {/* Show selected value for verification */}
                  {field.value && (
                    <div className="mt-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-xs text-gray-600">Selected College:</p>
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {field.value}
                        {selectedCollegeKey === 'pccoe' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            PCCOE Main Branch
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Add team formation rules */}
                  <div className="mt-2 p-3 bg-yellow-50/50 border border-yellow-100 rounded-md">
                    <ul className="text-[11px] sm:text-sm text-yellow-600 space-y-1">
                      <li>• PCCOE students can only team up with other PCCOE students</li>
                      <li>• Non-PCCOE students can only team up with other non-PCCOE students</li>
                    </ul>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'prn':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="prn"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={formItemClasses}>
                <FormLabel className={labelClasses}>PRN</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your PRN" className={inputClasses} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'branch':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="branch"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={formItemClasses}>
                <FormLabel className={labelClasses}>Branch</FormLabel>
                <div className="space-y-3">
                  <Select 
                    value={isOtherBranch ? "_other" : Object.entries(BRANCH_OPTIONS).find(([_, label]) => label === field.value)?.[0] || "_other"}
                    onValueChange={(value) => {
                      if (value === "_other") {
                        setIsOtherBranch(true);
                        field.onChange('');
                        return;
                      }
                      setIsOtherBranch(false);
                      field.onChange(BRANCH_OPTIONS[value as keyof typeof BRANCH_OPTIONS] || '');
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClasses}>
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
                    <FormControl>
                      <Input
                        placeholder="Enter your branch name"
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e.target.value.replace(/^\s+/g, ''));
                        }}
                        className={inputClasses}
                      />
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'class':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="class"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={formItemClasses}>
                <FormLabel className={labelClasses}>Class/Division</FormLabel>
                <div className="space-y-3">
                  <Select
                    value={isOtherClass ? "_other" : field.value || "_other"}
                    onValueChange={(value) => {
                      if (value === "_other") {
                        setIsOtherClass(true);
                        field.onChange('');
                        return;
                      }
                      setIsOtherClass(false);
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClasses}>
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
                    <FormControl>
                      <Input
                        placeholder="Enter your division"
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e.target.value.replace(/^\s+/g, ''));
                        }}
                        className={inputClasses}
                      />
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'gender':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name="gender"
            defaultValue=""
            render={({ field }) => (
              <FormItem className={formItemClasses}>
                <FormLabel className={labelClasses}>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={inputClasses}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
      {['full_name', 'phone', 'college_name', 'prn', 'branch', 'class', 'gender'].map(fieldName => 
        renderField(fieldName)
      )}
    </div>
  );
}

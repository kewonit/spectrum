"use client";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, Image as ImageIcon, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface PaymentScreenshotUploadProps {
  onUpload: (url: string) => void;
  screenshotUrl?: string;
  isRequired?: boolean;
}

export default function PaymentScreenshotUpload({ 
  onUpload, 
  screenshotUrl: initialUrl = "", 
  isRequired = true 
}: PaymentScreenshotUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);

    if (!selected) {
      setSelectedFileName("");
      return;
    }

    if (!selected.type.startsWith('image/')) {
      setError("Please select an image file");
      setSelectedFileName("");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setSelectedFileName("");
      return;
    }

    setFile(selected);
    setSelectedFileName(selected.name);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      onUpload(url);
      toast.success("Screenshot uploaded successfully");
      
      // Clear file input after successful upload
      const input = document.getElementById('screenshot') as HTMLInputElement;
      if (input) input.value = '';
      setFile(null);
      setSelectedFileName("");
      
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload screenshot. Please try again.");
      toast.error("Upload failed", {
        description: "Please try again"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Payment Screenshot
        </CardTitle>
        <CardDescription>
          Upload a screenshot of your payment confirmation
          {isRequired && " (required)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input Section - Updated for better mobile responsiveness */}
        <div className="space-y-2">
          <Label htmlFor="screenshot" className="text-sm font-medium">
            Choose Screenshot
          </Label>
          
          {/* Updated file input layout */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <div className="border rounded-md px-3 py-2 text-sm bg-white truncate"> {/* Added truncate */}
                {selectedFileName || "No file chosen"}
              </div>
            </div>
            {file && (
              <Button
                type="button"
                onClick={uploadFile}
                disabled={uploading}
                className="shrink-0 bg-green-600 hover:bg-green-700 w-full sm:w-auto" // Made full width on mobile
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="truncate">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    <span className="truncate">Upload Screenshot</span>
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Filename display with truncation */}
          {selectedFileName && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              Selected: {selectedFileName}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm break-words">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Preview Section - Updated for better responsiveness */}
        {previewUrl && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-lg border">
              <Image
                src={previewUrl}
                alt="Payment Screenshot"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <p className="text-sm text-gray-500 text-center break-words">
              {previewUrl.includes('digitaloceanspaces.com') 
                ? "Screenshot uploaded successfully"
                : "Click 'Upload Screenshot' to save your image"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

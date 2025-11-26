'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  useUser,
  useFirestore,
  updateDocumentNonBlocking,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function VerifyIdPage() {
  const { user, userData } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Basic validation for image files
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., PNG, JPG).',
        });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file || !user) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select your ID card to upload.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, you would upload the file to Firebase Storage
      // and store the URL. For this example, we'll just update the status.
      const userRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userRef, {
        verificationStatus: 'Pending',
        // In a real app, you would add:
        // idCardUrl: uploadedFileUrl
      });

      toast({
        title: 'ID Uploaded Successfully',
        description:
          'Your ID is now under review. We will notify you once it is processed.',
      });

      router.push('/profile');
    } catch (error) {
      console.error('Error submitting ID:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was a problem submitting your ID. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Verify Your Identity
            </CardTitle>
            <CardDescription>
              Please upload a clear image of a government-issued ID card (e.g.,
              Driver's License, Passport).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {userData?.verificationStatus === 'Rejected' && (
                 <div className="text-center p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground">
                    <p className="font-semibold">Your previous submission was rejected.</p>
                    <p className="text-sm">Please ensure your ID is clear, valid, and fully visible.</p>
                </div>
            )}
            <div
              className="flex items-center justify-center w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
              >
                {preview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={preview}
                      alt="ID Preview"
                      fill
                      className="object-contain rounded-lg p-2"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or GIF (MAX. 5MB)
                    </p>
                  </div>
                )}

                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/gif"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-xs">
                    {file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              disabled={isSubmitting}
            >
              Do it Later
            </Button>
            <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Verification'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

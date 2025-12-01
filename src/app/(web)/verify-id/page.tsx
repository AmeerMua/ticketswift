'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
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
import { UploadCloud, File, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { verifyIdCard } from '@/ai/flows/verify-id-card-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type VerificationState = 'idle' | 'verifying' | 'success' | 'error';
type VerificationResult = {
    state: VerificationState;
    message: string | null;
}

export default function VerifyIdPage() {
  const { user, userData } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationResult>({ state: 'idle', message: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
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
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        runAiVerification(dataUrl);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const runAiVerification = async (photoDataUri: string) => {
    setVerification({ state: 'verifying', message: 'Analyzing ID card...' });
    try {
        const result = await verifyIdCard({ photoDataUri });
        if (result.isIdCard && result.hasFace) {
            let message = "AI verification successful. Ready for submission.";
            if (result.dateOfBirth) {
                message += ` DOB found: ${result.dateOfBirth}.`;
            }
            setVerification({ state: 'success', message });
        } else {
            setVerification({ state: 'error', message: result.reason || "This does not appear to be a valid ID card. Please try again." });
        }
    } catch (e) {
        console.error(e);
        setVerification({ state: 'error', message: 'An error occurred during AI verification. You can still try to submit.' });
    }
  }


  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setVerification({ state: 'idle', message: null });
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
  
  const isSubmitDisabled = !file || isSubmitting || verification.state === 'verifying' || verification.state === 'error';

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
              Driver's License, Passport). Our AI will pre-verify your submission.
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
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg ${!preview ? 'cursor-pointer' : ''} bg-card hover:bg-muted`}
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
                  disabled={!!preview}
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">
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

            {verification.state !== 'idle' && (
                 <Alert variant={verification.state === 'error' ? 'destructive' : 'default'}>
                    {verification.state === 'verifying' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {verification.state === 'error' && <AlertCircle className="h-4 w-4" />}
                    {verification.state === 'success' && <CheckCircle className="h-4 w-4" />}
                    <AlertTitle>
                        {verification.state === 'verifying' && 'Verifying...'}
                        {verification.state === 'error' && 'Verification Failed'}
                        {verification.state === 'success' && 'Verification Successful'}
                    </AlertTitle>
                    <AlertDescription>{verification.message}</AlertDescription>
                </Alert>
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
            <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
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

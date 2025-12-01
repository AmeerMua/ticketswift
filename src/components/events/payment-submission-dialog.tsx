'use client';

import { useState, ChangeEvent, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, File, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyPaymentReceipt } from '@/ai/flows/verify-payment-receipt-flow';

interface PaymentSubmissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (screenshotFile: File) => Promise<void>;
  totalPrice: number;
  userName: string;
}

type VerificationState = 'idle' | 'verifying' | 'success' | 'error';
type VerificationResult = {
    state: VerificationState;
    message: string | null;
}

export function PaymentSubmissionDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  totalPrice,
  userName,
}: PaymentSubmissionDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationResult>({ state: 'idle', message: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    setVerification({ state: 'verifying', message: 'Analyzing receipt...' });
    try {
        const result = await verifyPaymentReceipt({ 
            photoDataUri,
            expectedAmount: totalPrice,
        });

        if (result.isReceipt && result.amountMatches) {
            setVerification({ state: 'success', message: "AI verification successful. Ready for submission." });
        } else {
            setVerification({ state: 'error', message: result.reason || "This does not appear to be a valid receipt. Please try again." });
        }
    } catch (e) {
        console.error(e);
        // Allow submission even if AI fails, for manual review
        setVerification({ state: 'success', message: 'Could not run AI-check. Your submission will be reviewed manually.' });
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
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No Screenshot',
        description: 'Please upload a screenshot of your payment.',
      });
      return;
    }
    setIsSubmitting(true);
    await onSubmit(file);
    setIsSubmitting(false);
    // Reset state on close
    onOpenChange(false);
  };
  
  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setFile(null);
        setPreview(null);
        setVerification({ state: 'idle', message: null });
        setIsSubmitting(false);
    }
    onOpenChange(open);
  }
  
  const isSubmitDisabled = !file || isSubmitting || verification.state === 'verifying' || verification.state === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className='font-headline'>Complete Your Booking</DialogTitle>
          <DialogDescription>
            To finalize your booking, please transfer the total amount of <span className='font-bold text-primary'>${totalPrice.toFixed(2)}</span> to one of the accounts below and upload a screenshot of the transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className='py-4 space-y-4 text-sm'>
            <div className='p-4 rounded-lg bg-muted/50 border'>
                <h3 className='font-semibold mb-2'>Payment Details</h3>
                <div className='space-y-3'>
                    <div>
                        <p className='font-medium'>EasyPaisa / JazzCash</p>
                        <p className='text-muted-foreground'>Account Name: Ameer Muawiyah</p>
                        <p className='text-muted-foreground'>EasyPaisa: 0300 1234567</p>
                        <p className='text-muted-foreground'>JazzCash: 0300 1234567</p>
                    </div>
                    <Separator/>
                    <div>
                        <p className='font-medium'>Bank Transfer</p>
                        <p className='text-muted-foreground'>Bank Name: Alfalah Bank</p>
                        <p className='text-muted-foreground'>Account Number: 12345678901234</p>
                        <p className='text-muted-foreground'>Account Holder: Ameer Muawiyah</p>
                    </div>
                </div>
            </div>

            <div
              className="flex items-center justify-center w-full"
              onClick={() => !preview && fileInputRef.current?.click()}
            >
                <label htmlFor="screenshot-upload" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg ${!preview ? 'cursor-pointer' : ''} bg-card hover:bg-muted`}>
                    {preview ? (
                        <div className="relative w-full h-full">
                            <Image src={preview} alt="Screenshot Preview" fill className="object-contain rounded-lg p-2" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Upload Payment Screenshot</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PNG or JPG</p>
                        </div>
                    )}
                    <Input id="screenshot-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" disabled={!!preview} />
                </label>
            </div>
            {file && (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRemoveFile}>
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
                        {verification.state === 'verifying' && 'Verifying Receipt...'}
                        {verification.state === 'error' && 'Verification Failed'}
                        {verification.state === 'success' && 'Verification Complete'}
                    </AlertTitle>
                    <AlertDescription>{verification.message}</AlertDescription>
                </Alert>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

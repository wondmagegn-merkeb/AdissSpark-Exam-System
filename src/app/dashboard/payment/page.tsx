
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

const paymentPlans = [
  { id: 'monthly', name: 'Monthly Plan', price: '100 ETB/month', description: 'Access all premium features, cancel anytime.' },
  { id: 'yearly', name: 'Yearly Plan (Save 20%)', price: '960 ETB/year', description: 'Best value! Get 12 months for the price of 10.' },
];

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { toggleSubscription, isSubscribed } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>(paymentPlans[0].id);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!isSubscribed) {
      toggleSubscription(); // This will set isSubscribed to true
    }
    
    toast({
      title: 'Payment Successful!',
      description: `You've successfully subscribed to the ${paymentPlans.find(p => p.id === selectedPlan)?.name}. Welcome to Premium!`,
      variant: 'default', 
    });
    setIsLoading(false);
    router.push('/dashboard'); // Redirect to dashboard after successful payment
  };

  if (isSubscribed) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center text-green-600">
              <ShieldCheck className="mr-2 h-7 w-7" />
              You are Already Subscribed!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Thank you for being a premium member. You have access to all exclusive features.
            </p>
            <Image 
              src="https://placehold.co/400x200.png" 
              alt="Premium Features" 
              width={400} 
              height={200} 
              className="rounded-md mb-4 mx-auto"
              data-ai-hint="premium badge"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" size="sm" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go Back
      </Button>
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Upgrade to Premium</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            Unlock all features and get the best out of ADDISSPARK.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Choose Your Plan:</h3>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
              {paymentPlans.map((plan) => (
                <Label
                  key={plan.id}
                  htmlFor={plan.id}
                  className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{plan.name}</span>
                    <RadioGroupItem value={plan.id} id={plan.id} className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-primary font-medium mt-1">{plan.price}</span>
                  <span className="text-xs text-muted-foreground mt-1">{plan.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Payment Details (Mock)</h3>
            <p className="text-sm text-muted-foreground">
              This is a simulated payment process. No real payment will be made.
            </p>
             <div className="aspect-[16/3] w-full max-w-xs mx-auto">
              <Image 
                src="https://placehold.co/400x75.png" 
                alt="Mock Payment Methods" 
                width={400} 
                height={75} 
                className="rounded-md object-contain"
                data-ai-hint="payment logos"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            size="lg" 
            className="w-full font-semibold text-lg py-6" 
            onClick={handlePayment} 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Confirm Payment & Subscribe
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By clicking "Confirm Payment", you agree to our (mock) Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

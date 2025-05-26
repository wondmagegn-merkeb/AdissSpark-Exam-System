
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SubmitFeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a subject and a message for your feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call to submit feedback
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Feedback Submitted:", {
      userId: user?.id,
      userEmail: user?.email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(false);
    setSubject('');
    setMessage('');
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your feedback. We'll review it shortly.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Submit Your Feedback</CardTitle>
          <CardDescription>
            We value your input! Let us know how we can improve ADDISSPARK.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Issue with exam timer, Suggestion for new resource"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Please describe your feedback in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

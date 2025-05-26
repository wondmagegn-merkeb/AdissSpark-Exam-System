
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import Image from "next/image";

export default function AgentPage() {
  return (
    <div className="container mx-auto py-8 text-center">
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <Bot className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl">Meet Your AI Agent</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your personal assistant for study plans, quick answers, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Image
            src="https://placehold.co/600x350.png"
            alt="AI Agent Interface"
            width={600}
            height={350}
            className="rounded-lg shadow-md mx-auto"
            data-ai-hint="ai robot chat"
          />
          <p className="text-muted-foreground">
            Our advanced AI agent is here to help you navigate your studies,
            generate personalized plans, and answer your questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/dashboard/study-plan">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate AI Study Plan
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/chat">
                 <MessageSquare className="mr-2 h-5 w-5" /> {/* Assuming MessageSquare is imported if used */}
                Chat with Support
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            More AI-powered features coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// If MessageSquare is not already available via another import in the context of this file,
// ensure it's imported from lucide-react:
// import { MessageSquare } from 'lucide-react';

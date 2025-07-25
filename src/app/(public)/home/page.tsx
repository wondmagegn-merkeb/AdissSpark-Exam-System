import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Edit3, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Comprehensive Resources',
    description: 'Access a vast library of short notes and video lectures curated by experts.',
    dataAiHint: 'library books',
  },
  {
    icon: <Edit3 className="h-8 w-8 text-primary" />,
    title: 'Realistic Exam Simulations',
    description: 'Practice with interactive exams that mimic the actual test environment.',
    dataAiHint: 'student test',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Performance Tracking',
    description: 'Monitor your progress with detailed analytics and graphical result representation.',
    dataAiHint: 'charts graph',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-background to-accent/20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <Image
              src="https://placehold.co/800x600.png"
              alt="ADDISSPARK dashboard preview"
              width={800}
              height={600}
              className="rounded-lg shadow-xl"
              data-ai-hint="dashboard interface"
              priority
            />
          </div>
          <div className="text-center md:text-left animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Ace Your Exit Exams with <span className="text-primary">ADDISSPARK</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg leading-8 text-muted-foreground">
              Your all-in-one solution for comprehensive study materials, realistic practice exams, and personalized learning. Start your journey to success with ADDISSPARK today!
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center text-foreground sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-center text-lg text-muted-foreground">
              Our platform is packed with features designed to help you prepare effectively and efficiently.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${0.2 * (index + 1)}s` }}>
                <Card className="flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 flex-grow flex items-end">
                      <Image src={`https://placehold.co/300x200.png`} alt={feature.title} width={300} height={200} className="rounded-md" data-ai-hint={feature.dataAiHint} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4 text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to start preparing?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Join thousands of students who trust ADDISSPARK for their exam success.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/register">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

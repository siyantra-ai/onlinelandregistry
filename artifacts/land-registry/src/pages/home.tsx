import { useListServices } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { FileText, CheckCircle2, ShieldCheck, Clock, FileSearch } from "lucide-react";

export default function Home() {
  const { data: services, isLoading } = useListServices();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-heading leading-tight">
              Official UK Land Registry Documents, <span className="text-accent">Delivered Fast.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
              Obtain title registers, plans, and deeds online in minutes. Designed for homeowners, solicitors, and property professionals seeking premium, hassle-free document retrieval.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/order">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 font-semibold shadow-md text-base px-8 h-14 hover-elevate w-full sm:w-auto">
                  Start Your Order
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70 font-medium px-4">
                <CheckCircle2 className="w-5 h-5 text-accent" /> No hidden fees
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70 font-medium px-4">
                <CheckCircle2 className="w-5 h-5 text-accent" /> Secure processing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="bg-primary/5 p-3 rounded-full text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-primary font-heading">Secure & Confidential</h3>
              <p className="text-sm text-muted-foreground">Bank-level encryption for all your details and document deliveries.</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="bg-primary/5 p-3 rounded-full text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-primary font-heading">Fast Turnaround</h3>
              <p className="text-sm text-muted-foreground">Most documents are retrieved and delivered within 1-2 hours.</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="bg-primary/5 p-3 rounded-full text-primary">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-primary font-heading">Official Documents</h3>
              <p className="text-sm text-muted-foreground">100% official documentation sourced directly from HM Land Registry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50" id="services">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary">Select a Service</h2>
            <p className="text-muted-foreground">
              Choose the document you need. If you're unsure, the Title Register and Title Plan combination is our most requested service.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="h-[300px]">
                  <CardHeader><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full" /></CardHeader>
                  <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                  <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services?.map((service) => (
                <Card key={service.id} className={`flex flex-col border-border/60 shadow-sm transition-all hover:shadow-md hover:border-primary/20 ${service.popular ? 'ring-2 ring-accent ring-offset-2 relative' : ''}`}>
                  {service.popular && (
                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-primary/5 p-2.5 rounded-lg text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</span>
                        <div className="font-bold text-2xl font-heading text-primary">£{service.basePrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-heading text-primary">{service.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="text-sm border-l-2 border-accent/50 pl-3 py-1 text-muted-foreground">
                        <span className="font-medium text-foreground block mb-1">Includes:</span>
                        {service.deliverables}
                      </div>
                      {service.turnaround && (
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Clock className="w-4 h-4 text-primary/60" />
                          {service.turnaround}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/order?service=${service.slug}`} className="w-full">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group" variant={service.popular ? "default" : "outline"}>
                        Order Now
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary">How It Works</h2>
            <p className="text-muted-foreground">
              A streamlined 4-step process designed for simplicity and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border/80"></div>
            
            {[
              { step: 1, title: "Select Service", desc: "Choose the document type you need." },
              { step: 2, title: "Property Details", desc: "Provide the address or title number." },
              { step: 3, title: "Checkout", desc: "Review your order and pay securely." },
              { step: 4, title: "Delivery", desc: "Receive your official documents via email." }
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-primary text-primary flex items-center justify-center font-heading font-bold text-3xl shadow-sm z-10">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg font-heading text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

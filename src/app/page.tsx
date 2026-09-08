import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SearchForm from "@/components/SearchForm";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-12 py-10">
      
      <div className="space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-primary">
          College Carpooling Made Easy
        </h1>
        <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Share rides with other students, save money on gas, and reduce your carbon footprint. 
          Whether you are driving home for the weekend or commuting to campus, Tpool connects you.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-card border text-card-foreground shadow-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold text-left mb-4">Find a Ride</h2>
        <SearchForm />
      </div>

      {!session && (
        <div className="flex items-center justify-center gap-x-6 pt-8 border-t w-full max-w-lg">
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
            Sign In <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

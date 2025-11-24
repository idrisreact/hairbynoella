"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await authClient.signIn.email({
      email,
      password,
    }, {
        onRequest: () => {
            setIsLoading(true);
        },
        onSuccess: () => {
            router.push("/");
            router.refresh();
        },
        onError: (ctx) => {
            setError(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gold-400/20">
      <h2 className="text-3xl font-serif font-bold text-dark-400 mb-6 text-center">Sign In</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>

        <Button 
            type="submit" 
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3"
            disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-dark-500">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-gold-600 hover:underline font-medium">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await authClient.signUp.email({
      email,
      password,
      name,
    }, {
        onRequest: () => {
            setIsLoading(true);
        },
        onSuccess: () => {
            router.push("/");
            router.refresh();
        },
        onError: (ctx) => {
            setError(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gold-400/20">
      <h2 className="text-3xl font-serif font-bold text-dark-400 mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
            minLength={8}
          />
        </div>

        <Button 
            type="submit" 
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3"
            disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-dark-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-gold-600 hover:underline font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}

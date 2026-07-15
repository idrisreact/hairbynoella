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
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
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
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-dark-500">Or continue with</span>
          </div>
        </div>

        <Button
            type="button"
            variant="outline"
            className="w-full py-3"
            onClick={async () => {
                setError(null);
                await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/",
                }, {
                    onError: (ctx) => {
                        setError(ctx.error.message);
                    }
                });
            }}
        >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
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
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-dark-500">Or continue with</span>
          </div>
        </div>

        <Button
            type="button"
            variant="outline"
            className="w-full py-3"
            onClick={async () => {
                setError(null);
                await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/",
                }, {
                    onError: (ctx) => {
                        setError(ctx.error.message);
                    }
                });
            }}
        >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
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

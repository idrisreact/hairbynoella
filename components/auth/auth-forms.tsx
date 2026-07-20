"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Admins may type either their username ("noella") or their email address
 * into the single identifier field. An "@" is the only thing that
 * distinguishes the two, since usernames are alphanumeric + underscores.
 */
const looksLikeEmail = (identifier: string) => identifier.includes("@");

export function SignInForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const trimmed = identifier.trim();
    const handlers = {
      onSuccess: () => {
        router.push("/admin");
        router.refresh();
      },
      onError: (ctx: { error: { message?: string } }) => {
        setError(ctx.error.message ?? "Sign in failed. Please try again.");
        setIsLoading(false);
      },
    };

    if (looksLikeEmail(trimmed)) {
      await authClient.signIn.email({ email: trimmed, password }, handlers);
    } else {
      await authClient.signIn.username({ username: trimmed, password }, handlers);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gold-400/20">
      <h2 className="text-3xl font-serif font-bold text-dark-400 mb-2 text-center">Admin Sign In</h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        This area is for salon staff only.
      </p>

      {error && (
        <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="admin-identifier" className="text-sm font-medium text-dark-500">
            Username or email
          </label>
          <input
            id="admin-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="noella"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-password" className="text-sm font-medium text-dark-500">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
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
      </form>
    </div>
  );
}

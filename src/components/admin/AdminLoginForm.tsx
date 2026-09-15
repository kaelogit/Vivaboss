"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm({
  configured,
}: {
  configured: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError("Supabase is not configured. Add keys to .env.local first.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Role check happens in the admin layout; non-admins get bounced back.
    router.refresh();
    router.push("/admin");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!configured || loading}
          placeholder="admin@vivabossfusion.co.uk"
          className="mt-2 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm text-vb-ink outline-none ring-vb-accent focus:ring-1 disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!configured || loading}
          placeholder="••••••••"
          className="mt-2 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm text-vb-ink outline-none ring-vb-accent focus:ring-1 disabled:opacity-60"
        />
      </div>

      {error && (
        <p className="text-sm text-vb-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!configured || loading}
        className="flex h-11 w-full items-center justify-center gap-2 bg-vb-ink font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper transition-colors hover:bg-vb-accent disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
      </button>
    </form>
  );
}

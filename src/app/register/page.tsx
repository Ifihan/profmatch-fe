"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Container } from "@/components/layout";
import { AuthForm } from "@/components/auth";
import { useAuth } from "@/context";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (data: {
    name?: string;
    email: string;
    password: string;
  }) => {
    setError(null);
    try {
      await register(data.name || "", data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    }
  };

  if (authLoading) {
    return (
      <PageLayout>
        <Container className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </Container>
      </PageLayout>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <AuthForm mode="register" onSubmit={handleSubmit} error={error} />
      </Container>
    </PageLayout>
  );
}

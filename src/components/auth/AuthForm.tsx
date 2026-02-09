"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Button } from "@/components/ui";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error?: string | null;
}

export function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const isLogin = mode === "login";

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!isLogin && !name.trim()) {
      errors.name = "Name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (!isLogin && password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({ name: isLogin ? undefined : name, email, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-text-secondary">
          {isLogin
            ? "Sign in to access your saved searches"
            : "Join ProfMatch to save your research matches"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {!isLogin && (
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={validationErrors.name}
            disabled={isLoading}
          />
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationErrors.email}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder={isLogin ? "Enter your password" : "Create a password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
          disabled={isLoading}
        />

        {!isLogin && (
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={validationErrors.confirmPassword}
            disabled={isLoading}
          />
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          {isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-medium text-primary hover:text-primary-light"
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}

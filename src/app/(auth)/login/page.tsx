"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Stethoscope, Eye, EyeOff } from "lucide-react";
import { login } from "@/services/auth.service";
import { setAuthCookies } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    try {
      const res = await login(data);
      const u = res.data.user;
      setAuthCookies(res.data.token, {
        id: u.id,
        storeId: u.storeId,
        role: u.role,
        name: u.name,
        email: u.email,
      });
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-[14px] bg-[#2F8F83] flex items-center justify-center mb-4">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1F2D2B]">Welcome to MediBill</h1>
          <p className="text-[#5A7370] text-base mt-1">Sign in to manage your medical store.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[14px] border border-[#E2EEEC] shadow-[0_1px_3px_0_rgba(31,45,43,0.06)] p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-[#1F2D2B]">
                Email address <span className="text-[#D94F4F]">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="w-full min-h-[48px] px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] focus:border-transparent"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-[#D94F4F]">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-[#1F2D2B]">
                Password <span className="text-[#D94F4F]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full min-h-[48px] px-3 py-2.5 pr-11 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] focus:border-transparent"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7370] hover:text-[#1F2D2B] p-1"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-[#D94F4F]">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-[#FDECEA] text-[#7A1F1F] text-sm px-3 py-2.5 rounded-[8px]">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] bg-[#2F8F83] text-white font-semibold text-base rounded-[10px] hover:bg-[#236F65] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#5A7370] mt-6">
          MediBill — billing and inventory for Indian medical stores
        </p>
      </div>
    </div>
  );
}

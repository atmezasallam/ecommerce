"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SignUp } from "@clerk/nextjs";
import { BadgeCheck, CheckCircle2, Lock, Shield } from "lucide-react";

const features = [
  "Thousands of products from verified sellers",
  "Secure payments & buyer protection",
  "Fast delivery to your doorstep",
  "Easy returns & 24/7 support",
];

const stats = [
  { value: "10K+", label: "Sellers" },
  { value: "500K+", label: "Products" },
  { value: "2M+", label: "Happy Customers" },
];

const panelTransition = { duration: 0.55, ease: "easeOut" as const };

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-x-hidden lg:grid-cols-2">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={panelTransition}
        className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f3b2e] via-[#0c2f25] to-[#08221a] lg:block"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(149,207,178,0.30),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute left-10 top-10 h-56 w-56 rounded-full bg-[#95CFB2]/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 15, 0] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-teal-300/15 blur-3xl"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 p-12">
          <div className="w-full max-w-lg text-left">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="text-5xl font-bold tracking-tight text-white"
            >
              Salamo
            </motion.h1>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
              className="mt-3 h-0.5 bg-gradient-to-r from-[#95CFB2] via-emerald-300 to-teal-200"
            />
            <p className="mt-4 text-base text-[#cfe9dc]/90">Shop smarter. Live better.</p>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { delayChildren: 0.2, staggerChildren: 0.1 } } }}
            className="w-full max-w-lg space-y-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-3 rounded-lg px-2 py-1 text-white/95 transition-colors hover:bg-white/5"
              >
                <CheckCircle2 className="h-5 w-5 text-[#95CFB2]" />
                <span className="text-sm xl:text-base">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="mt-4 flex items-center divide-x divide-[#95CFB2]/15 rounded-2xl border border-[#95CFB2]/20 bg-[#0a2a20]/60 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-sm"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[#cfe9dc]/80">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={panelTransition}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-background p-6 sm:p-8"
      >
        <div className="mb-4 w-full max-w-md text-right text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium hover:text-foreground">
            Sign in →
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-foreground lg:hidden">Salamo</h2>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="mx-auto w-full max-w-md rounded-2xl border bg-card/80 p-4 shadow-lg backdrop-blur-sm sm:p-6"
        >
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full !max-w-none",
                cardBox: "w-full !max-w-none !m-0 shadow-none border-0 bg-transparent",
                card: "w-full !max-w-none !m-0 border-0 bg-transparent p-0 shadow-none",
                main: "w-full !max-w-none",
                headerTitle: "text-2xl font-bold text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton:
                  "border border-input bg-background hover:bg-accent text-foreground font-medium rounded-xl h-11",
                formFieldInput:
                  "border border-input bg-background rounded-xl h-11 px-4 text-foreground focus:ring-2 focus:ring-primary",
                formButtonPrimary:
                  "bg-[#95CFB2] hover:bg-[#7dbfa4] text-slate-900 rounded-xl h-11 font-semibold w-full transition-colors",
                footerActionLink: "text-primary hover:text-primary/80 font-medium",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground text-xs",
                formFieldLabel: "text-sm font-medium text-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary",
              },
              variables: {
                borderRadius: "0.75rem",
                colorPrimary: "#95CFB2",
                colorBackground: "transparent",
                colorText: "currentColor",
                colorInputBackground: "transparent",
              },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Secure Login
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            256-bit Encrypted
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified Platform
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

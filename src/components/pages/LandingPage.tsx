// src/components/pages/LandingPage.tsx

import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { NavixoLogo } from "../NavixoLogo";
import { supabase } from "../../supabaseClient";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

function SectionCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-[15px]">
        {description}
      </p>
    </div>
  );
}

function StatPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300">
      <Icon className="h-4 w-4 text-cyan-300" />
      {label}
    </span>
  );
}

function FeatureRow({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1016] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          <Icon className="h-4.5 w-4.5 text-violet-300" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold tracking-tight text-white sm:text-base">
            {title}
          </h4>
          <p className="mt-1.5 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const primaryAction = hasSession
    ? () => navigate("/dashboard")
    : onGetStarted;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0F]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollToSection("top")}
            className="flex items-center gap-3"
          >
            <NavixoLogo size={30} variant="white" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-tight text-white">
                Navixo
              </p>
              <p className="text-xs text-slate-400">Execution OS</p>
            </div>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => scrollToSection("problem")}
              className="text-sm font-semibold tracking-tight text-slate-300 transition hover:text-white"
            >
              Problem
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-semibold tracking-tight text-slate-300 transition hover:text-white"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="text-sm font-semibold tracking-tight text-slate-300 transition hover:text-white"
            >
              Features
            </button>
          </nav>

          <Button
            onClick={primaryAction}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            {hasSession ? "Dashboard" : "Get started"}
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cyan-200 uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Student Execution OS
              </div>

              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                Stop guessing.
                <span className="block text-cyan-300">Start executing.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Navixo turns placement preparation into a structured system:
                generate a roadmap, receive daily tasks, track execution, and
                adapt based on progress.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={primaryAction}
                  className="rounded-2xl bg-white px-5 py-3 text-base font-semibold text-slate-950 hover:bg-slate-200"
                >
                  <span className="flex items-center gap-2">
                    {hasSession ? "Open dashboard" : "Start now"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollToSection("how-it-works")}
                  className="rounded-2xl border-white/15 bg-transparent px-5 py-3 text-base font-semibold text-white hover:bg-white/5"
                >
                  How it works
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <StatPill icon={CheckCircle2} label="Execution-first" />
                <StatPill icon={ShieldCheck} label="Minimal AI dependency" />
                <StatPill icon={TrendingUp} label="Adaptive planning" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Route className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-white">
                      Roadmap generation
                    </p>
                    <p className="text-xs text-slate-400">
                      Structured phases and milestones
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[70%] rounded-full bg-cyan-300" />
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[52%] rounded-full bg-violet-300" />
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[84%] rounded-full bg-emerald-300" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <ClipboardList className="h-5 w-5 text-cyan-300" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    Daily tasks
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Small, bounded execution plan for today.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <LayoutDashboard className="h-5 w-5 text-violet-300" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    Progress tracking
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    See what changed and what comes next.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="problem"
          className="border-y border-white/10 bg-white/[0.02]"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Problem
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Students do not fail because of missing information.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-400 sm:text-lg">
                They fail because they do not know what to do today, what comes
                next, and whether they are actually progressing.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Simple flow. Less clutter. More execution.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <SectionCard
              icon={Target}
              title="1. Onboarding"
              description="Set your target role, background, and preparation context."
            />
            <SectionCard
              icon={Route}
              title="2. Roadmap"
              description="Generate a structured roadmap with phases and steps."
            />
            <SectionCard
              icon={ClipboardList}
              title="3. Daily tasks"
              description="Get a bounded set of tasks for the day."
            />
            <SectionCard
              icon={TrendingUp}
              title="4. Track progress"
              description="Check in, update status, and adapt the next plan."
            />
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Core features
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Built for the placement workflow.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureRow
                icon={Route}
                title="Roadmap"
                description="Structured, phase-based preparation plan."
              />
              <FeatureRow
                icon={ClipboardList}
                title="Tasks"
                description="Daily execution with a small task set."
              />
              <FeatureRow
                icon={TrendingUp}
                title="Progress"
                description="Track completion and momentum over time."
              />
              <FeatureRow
                icon={LayoutDashboard}
                title="Execution OS"
                description="Designed around action, not chat."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-violet-400/10 p-6 sm:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Start now
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Generate your roadmap and begin execution today.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Navixo is built to be explainable in interviews and useful in
                daily prep. Less noise, clearer structure, better consistency.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={primaryAction}
                className="rounded-2xl bg-white px-5 py-3 text-base font-semibold text-slate-950 hover:bg-slate-200"
              >
                {hasSession ? "Open dashboard" : "Get started"}
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollToSection("top")}
                className="rounded-2xl border-white/15 bg-transparent px-5 py-3 text-base font-semibold text-white hover:bg-white/5"
              >
                Back to top
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

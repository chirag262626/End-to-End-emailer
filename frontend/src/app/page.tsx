"use client";

import { useState, useRef } from "react";
import { generateEmail, getPortfolio, uploadPortfolio } from "@/lib/api";
import type { GenerateEmailResponse, PortfolioEntry } from "@/lib/api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateEmailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Portfolio state
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await generateEmail(url.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleViewPortfolio = async () => {
    if (!showPortfolio) {
      setPortfolioLoading(true);
      try {
        const data = await getPortfolio();
        setPortfolio(data.entries);
      } catch {
        setError("Failed to load portfolio");
      } finally {
        setPortfolioLoading(false);
      }
    }
    setShowPortfolio(!showPortfolio);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioLoading(true);
    try {
      const data = await uploadPortfolio(file);
      setPortfolio(data.entries);
      setShowPortfolio(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload portfolio"
      );
    } finally {
      setPortfolioLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-12 fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          AI-Powered Email Outreach
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-[var(--color-primary-light)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            Cold Email
          </span>{" "}
          Generator
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
          Generates personalized cold emails by correlating a job description with your custom portfolio context.
        </p>
      </div>

      <div className="w-full max-w-3xl fade-in-up space-y-6" style={{ animationDelay: "0.15s" }}>

        {/* Step 1: Portfolio Upload */}
        <div className="glass p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="text-8xl font-black italic">1</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold">1</span>
            Upload Portfolio / Company Info
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Provide your portfolio, case studies, or company overview (TXT, PDF, CSV) so the AI can pull relevant experience.
          </p>

          <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              {portfolio.length > 0 ? (
                <div className="flex items-center justify-center p-2 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="flex items-center justify-center p-2 rounded-lg bg-[var(--color-surface-light)] text-[var(--color-text-muted)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {portfolio.length > 0 ? "Portfolio Loaded" : "No Portfolio Loaded"}
                </p>
                <p className="text-xs text-[var(--color-text-dim)]">
                  {portfolio.length > 0 ? "The AI will use this context for tailoring." : "Using generic filler unless provided."}
                </p>
              </div>
            </div>

            <label className="group relative px-4 py-2 rounded-lg font-medium text-sm text-[var(--color-text)] bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] border border-[var(--color-border)] transition-all cursor-pointer flex items-center gap-2">
              {portfolioLoading ? (
                <svg className="animate-spin h-4 w-4 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              )}
              {portfolio.length > 0 ? "Replace File" : "Upload File"}
              <input ref={fileInputRef} type="file" accept=".csv,.txt,.pdf" onChange={handleUpload} className="hidden" disabled={portfolioLoading} />
            </label>
          </div>
        </div>

        {/* Step 2 & 3: URL and Generate */}
        <div className="glass p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="text-8xl font-black italic">2</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold">2</span>
            Paste Job Description URL
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Enter the URL of the job posting. The AI will extract requirements and draft the email.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="https://jobs.nike.com/job/R-33460"
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            />
            <button
              id="generate-btn"
              onClick={handleGenerate}
              disabled={loading}
              className="group relative px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
              style={{
                background: loading
                  ? "var(--color-surface-light)"
                  : "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
              }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate Email
                  </>
                )}
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl mt-6 fade-in-up">
          <div className="glass border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4 rounded-xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[var(--color-error)] mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-[var(--color-error)]">
                Error
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass p-6">
              <div className="h-4 w-32 rounded shimmer mb-4" />
              <div className="space-y-2">
                <div className="h-3 rounded shimmer" />
                <div className="h-3 rounded shimmer w-5/6" />
                <div className="h-3 rounded shimmer w-4/6" />
                <div className="h-3 rounded shimmer w-5/6" />
                <div className="h-3 rounded shimmer w-3/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Emails */}
      {result && !loading && (
        <div className="w-full max-w-2xl mt-8 space-y-6">
          <div className="flex items-center gap-3 fade-in-up">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
            <span className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Generated Emails ({result.emails.length})
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
          </div>

          {result.emails.map((email, index) => (
            <div
              key={index}
              className="glass p-6 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">
                      {result.jobs[index]?.role || `Email ${index + 1}`}
                    </h3>
                    {result.jobs[index]?.experience && (
                      <p className="text-xs text-[var(--color-text-dim)]">
                        {result.jobs[index].experience} experience
                      </p>
                    )}
                  </div>
                </div>
                <button
                  id={`copy-btn-${index}`}
                  onClick={() => handleCopy(email, index)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                  style={{
                    background:
                      copiedIndex === index
                        ? "var(--color-accent)"
                        : "var(--color-surface-light)",
                    color:
                      copiedIndex === index
                        ? "white"
                        : "var(--color-text-muted)",
                  }}
                >
                  {copiedIndex === index ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Skills Tags */}
              {result.jobs[index]?.skills &&
                result.jobs[index].skills!.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.jobs[index].skills!.map((skill, si) => (
                      <span
                        key={si}
                        className="px-2.5 py-0.5 rounded-full text-xs border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

              {/* Email Content */}
              <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)] font-mono">
                  {email}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-6 text-center">
        <p className="text-xs text-[var(--color-text-dim)]">
          Powered by LangChain & Groq • Built with Next.js
        </p>
      </footer>
    </main>
  );
}

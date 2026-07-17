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
          Paste a job posting URL and let AI generate a personalized cold email
          with your portfolio highlights.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-2xl fade-in-up" style={{ animationDelay: "0.15s" }}>
        <div className="glass p-6 sm:p-8">
          <label
            htmlFor="url-input"
            className="block text-sm font-medium text-[var(--color-text-muted)] mb-2"
          >
            Job Posting URL
          </label>
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
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        className="opacity-75"
                      />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 transition-transform group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate
                  </>
                )}
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          </div>

          {/* Portfolio Controls */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
            <button
              id="portfolio-btn"
              onClick={handleViewPortfolio}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors cursor-pointer flex items-center gap-1.5"
            >
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {showPortfolio ? "Hide" : "View"} Portfolio
            </button>
            <span className="text-[var(--color-border)]">|</span>
            <label className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer flex items-center gap-1.5">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleUpload}
                className="hidden"
                id="portfolio-upload"
              />
            </label>
          </div>
        </div>

        {/* Portfolio Table */}
        {showPortfolio && (
          <div
            className="glass mt-4 overflow-hidden fade-in-up"
          >
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Portfolio Entries
              </h3>
            </div>
            {portfolioLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg shimmer" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {portfolio.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-light)] transition-colors"
                  >
                    <span className="text-sm text-[var(--color-text)]">
                      {entry.techstack}
                    </span>
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--color-primary-light)] hover:underline truncate max-w-[200px]"
                    >
                      {entry.link}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

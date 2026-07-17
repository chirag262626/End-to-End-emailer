const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PortfolioEntry {
    techstack: string;
    link: string;
}

export interface GenerateEmailResponse {
    emails: string[];
    jobs: Array<{
        role?: string;
        experience?: string;
        skills?: string[];
        description?: string;
    }>;
}

export interface PortfolioResponse {
    entries: PortfolioEntry[];
}

export async function generateEmail(url: string): Promise<GenerateEmailResponse> {
    const res = await fetch(`${API_BASE}/api/generate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Server error: ${res.status}`);
    }

    return res.json();
}

export async function getPortfolio(): Promise<PortfolioResponse> {
    const res = await fetch(`${API_BASE}/api/portfolio`);

    if (!res.ok) {
        throw new Error(`Failed to fetch portfolio: ${res.status}`);
    }

    return res.json();
}

export async function uploadPortfolio(file: File): Promise<PortfolioResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/portfolio/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Upload failed: ${res.status}`);
    }

    return res.json();
}

export async function healthCheck(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        return res.ok;
    } catch {
        return false;
    }
}

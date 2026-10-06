'use client';

import { useState } from 'react';

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="h-9 rounded-full border border-rule px-4 text-[.88rem] text-soft transition-colors hover:border-ink hover:text-ink"
    >
      <span aria-live="polite">{copied ? 'Copied' : 'Copy address'}</span>
    </button>
  );
}

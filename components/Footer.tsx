import { PROFILE } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="wrap mt-24 flex flex-col gap-3 border-t border-rule py-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <p className="meta">
        © {new Date().getFullYear()} {PROFILE.full}
      </p>
      <a href="#top" className="meta link self-start text-ink">
        Back to top ↑
      </a>
    </footer>
  );
}

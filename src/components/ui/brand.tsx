import Link from 'next/link';

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${inverse ? 'text-white' : 'text-slate-900'}`}
      aria-label="Attender Home"
    >
      <div className="brand-mark" aria-hidden="true">
        A
      </div>
      <div className="flex flex-col">
        <span className="brand-text font-bold leading-tight">Attender</span>
        <span className="text-[10px] text-slate-500 font-medium leading-none">
          Attendance System
        </span>
      </div>
    </Link>
  );
}

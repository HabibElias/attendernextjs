import Link from 'next/link';
import { Brand } from '@/components/ui/brand';

export default function HomePage() {
  return (
    <main className="auth-container">
      <div className="auth-card text-center">
        <div className="flex justify-center mb-4">
          <Brand />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">
          Classroom Attendance
        </h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Fast, accurate, and stress-free attendance tracking for teachers and
          students.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="button button-primary w-full">
            Sign In
          </Link>
          <Link href="/signup" className="button button-secondary w-full">
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}

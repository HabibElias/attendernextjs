import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Attender — Classroom Attendance Management',
  description: 'Fast, accurate, and stress-free attendance tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

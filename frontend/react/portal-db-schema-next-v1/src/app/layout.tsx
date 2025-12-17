import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Database Schema Designer',
  description: 'TCGL database schemas designer and visualizer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

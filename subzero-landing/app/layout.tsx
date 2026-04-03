import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SubZero - Stop Paying for Subscriptions You Forgot',
  description: 'AI-powered subscription management. Track, optimize, and cancel unused subscriptions automatically.',
  openGraph: {
    title: 'SubZero - Smart Subscription Management',
    description: 'Stop wasting money on forgotten subscriptions. SubZero finds and cancels them for you.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

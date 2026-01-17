import { Metadata } from 'next';

const BASE_URL = 'https://cruxit.finance';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Compare Stocks | Cruxit',
  description: 'Compare stock fundamentals side-by-side on Cruxit',
  openGraph: {
    title: 'Compare Stocks | Cruxit',
    description: 'Side-by-side fundamental analysis',
    url: `${BASE_URL}/compare`,
    siteName: 'Cruxit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Stocks | Cruxit',
    description: 'Side-by-side fundamental analysis on Cruxit',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}

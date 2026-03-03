import type { Metadata } from 'next';
import { ConsoleView } from '@/components/console/console-view';

export const metadata: Metadata = {
  title: 'Console',
  description: 'Real-time market console with sortable stock data and detailed analysis panels.',
};

export default function ConsolePage() {
  return <ConsoleView />;
}

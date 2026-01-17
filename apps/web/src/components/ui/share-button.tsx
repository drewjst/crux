'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** X (formerly Twitter) brand logo */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const DEFAULT_HASHTAGS = ['stocks', 'investing', 'cruxit'];
const BASE_URL = 'https://cruxit.finance';

interface ShareButtonProps extends Omit<ButtonProps, 'onClick'> {
  ticker: string;
  text?: string;
  hashtags?: string[];
  /** Custom URL to share. Defaults to stock page URL */
  url?: string;
}

function buildShareUrl(shareUrl: string, text: string, hashtags: string[]): string {
  const params = new URLSearchParams({
    text,
    url: shareUrl,
    hashtags: hashtags.join(','),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function ShareButton({
  ticker,
  text,
  hashtags = DEFAULT_HASHTAGS,
  url,
  variant = 'ghost',
  size = 'icon',
  className,
  ...props
}: ShareButtonProps) {
  const shareText = text ?? `Check out ${ticker} analysis on Cruxit`;
  const sharePageUrl = url ?? `${BASE_URL}/stock/${ticker}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const intentUrl = buildShareUrl(sharePageUrl, shareText, hashtags);
    window.open(intentUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const isIconOnly = size === 'icon';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label={`Share ${ticker} on X`}
      {...props}
    >
      <XIcon className={cn('h-4 w-4', !isIconOnly && 'mr-2')} />
      {!isIconOnly && <span>Share</span>}
    </Button>
  );
}

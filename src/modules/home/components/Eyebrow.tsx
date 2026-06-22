import { cn } from '@/shared/lib/cn';

export function Eyebrow({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative mb-7 inline-block px-[30px] py-3 text-md md:text-2xl font-bold uppercase leading-none tracking-[2.2px]',
        'before:absolute before:left-0 before:top-0 before:h-[18px] before:w-[18px] before:border-l-4 before:border-t-4 before:border-current',
        'after:absolute after:bottom-0 after:right-0 after:h-[18px] after:w-[18px] after:border-b-4 after:border-r-4 after:border-current',
        dark ? 'text-[#00a8f1]' : 'text-[#00a8f1]',
        className
      )}
    >
      {children}
    </span>
  );
}

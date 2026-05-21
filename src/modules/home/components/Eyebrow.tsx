export function Eyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={[
        'relative mb-7 inline-block px-[30px] py-3 text-[17px] font-bold uppercase leading-none tracking-[2.2px]',
        'before:absolute before:left-0 before:top-0 before:h-[18px] before:w-[18px] before:border-l-4 before:border-t-4 before:border-current',
        'after:absolute after:bottom-0 after:right-0 after:h-[18px] after:w-[18px] after:border-b-4 after:border-r-4 after:border-current',
        dark ? 'text-[#00a8f1]' : 'text-[#00a8f1]',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

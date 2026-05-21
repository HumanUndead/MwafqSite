import { cn } from '@/lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div
      className={cn('mx-auto my-16.5 min-h-125 py-20 max-w-7xl', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;

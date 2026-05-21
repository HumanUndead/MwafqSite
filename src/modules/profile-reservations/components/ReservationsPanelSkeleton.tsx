export function ReservationsPanelSkeleton() {
  return (
    <div className='grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1'>
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className='h-[min(420px,70vw)] animate-pulse rounded-[2rem] border border-[#e8e9ef] bg-[#eef0f7]/90 max-[640px]:h-80'
          aria-hidden
        />
      ))}
    </div>
  );
}

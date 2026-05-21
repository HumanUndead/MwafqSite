type BookingPlaceholderStepProps = {
  message: string;
};

export function BookingPlaceholderStep({
  message,
}: BookingPlaceholderStepProps) {
  return (
    <p className='mb-6 text-[14.5px] leading-relaxed text-[#6b7196]'>
      {message}
    </p>
  );
}

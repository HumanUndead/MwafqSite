import { Play } from 'lucide-react';

type CourseLectureRowProps = {
  name: string;
};

export function CourseLectureRow({ name }: CourseLectureRowProps) {
  return (
    <li className='flex min-w-0 items-center gap-3 px-[18px] py-2 pl-11 text-[13.5px] wrap-break-word text-[#6b7196]'>
      <Play
        className='size-4 shrink-0 fill-[#00a8f1] text-[#00a8f1]'
        aria-hidden
      />
      {name}
    </li>
  );
}

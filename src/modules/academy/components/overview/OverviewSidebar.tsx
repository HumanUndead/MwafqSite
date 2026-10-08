import type { Dictionary } from '@/locales/types';
import { Panel, PanelHeader } from '@/shared/components/product';

type PlayerT = Dictionary['academyPlayer'];

/** End-column content of the enrolled overview: learning outcomes. */
export function OverviewSidebar({ t, whatYouLearn }: { t: PlayerT; whatYouLearn: string[] }) {
  if (whatYouLearn.length === 0) return null;

  return (
    <Panel aria-labelledby='overview-what-you-learn'>
      <PanelHeader id='overview-what-you-learn' title={t.whatYouLearn} />
      <ul className='mt-3 flex list-disc flex-col gap-2 ps-5 text-[14px] leading-6 text-[#4a5078] marker:text-[#6b7196]'>
        {whatYouLearn.map((item, index) => (
          <li key={index} className='wrap-break-word'>
            {item}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/**
 * Placeholder profile values until API wiring. Pass `contact` / `stats` props
 * from `PersonalInfoView` when data is loaded.
 */
export const personalInfoPlaceholderContact = {
  email: 'Mohammad@gmail.com',
  phone: '+966 54 000 0000',
  city: 'Riyadh',
  country: 'Saudi Arabia',
  mailingAddress:
    'King Fahd Road, Olaya District, Riyadh 12313, Saudi Arabia',
} as const;

export const personalInfoPlaceholderStats = {
  reservationsCount: '12',
  coursesOngoingCount: '9',
  coursesFinishedCount: '6',
} as const;

const statIconWrap = {
  sky: 'bg-[#dff5ff] text-[#27a7e7]',
  mint: 'bg-[#e8fbf7] text-[#12b7a2]',
  purple: 'bg-[#f1e8fb] text-[#8a48c7]',
} as const;

export { statIconWrap };

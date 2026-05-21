/** Fallback contact fields when session user has no value. */
export const personalInfoPlaceholderContact = {
  email: '—',
  phone: '—',
  city: '—',
  country: '—',
  mailingAddress: '—',
} as const;

const statIconWrap = {
  sky: 'bg-[#dff5ff] text-[#27a7e7]',
  mint: 'bg-[#e8fbf7] text-[#12b7a2]',
  purple: 'bg-[#f1e8fb] text-[#8a48c7]',
} as const;

export { statIconWrap };

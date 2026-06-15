export const CONTACT_CONTENT_ROOT_CATEGORY_ID = 195;
export const CONTACT_CONTENT_REVALIDATE_SECONDS = 60 * 10;
export const CONTACT_CONTENT_CACHE_TAG = `contact-content-${CONTACT_CONTENT_ROOT_CATEGORY_ID}`;

// Articles are flat (no child categories) — rank maps directly to meaning:
//   rank 1 → hero:        name = title,           shortDescription = description
//   rank 2 → email info:  name = label,           shortDescription = value
//   rank 3 → phone info:  name = label,           shortDescription = value
//   rank 4 → office info: name = label,           shortDescription = value
//   rank 5 → form name:   name = field label,     extraInfo = placeholder
//   rank 6 → form email:  name = field label,     extraInfo = placeholder
//   rank 7 → form phone:  name = field label,     extraInfo = placeholder
//   rank 8 → form message:name = field label,     extraInfo = placeholder
//   rank 9 → form submit: name = button label
//   rank 10→ success:     name = success title,   extraInfo = success description
export const CONTACT_ARTICLE_RANKS = {
  hero: 1,
  infoEmail: 2,
  infoPhone: 3,
  infoOffice: 4,
  formName: 5,
  formEmail: 6,
  formPhone: 7,
  formMessage: 8,
  formSubmit: 9,
  success: 10,
} as const;

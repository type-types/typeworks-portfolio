import ko from './ko.mjs';
import en from './en.mjs';
export const contactLocales = {ko, en};
export const contactLocalePath = lang => lang === 'ko' ? '/contact/' : `/${lang}/contact/`;
const keys = (value, prefix = '') => Object.entries(value).flatMap(([key,item]) => {
  if (key === 'cases') return [];
  return item && typeof item === 'object' ? keys(item, `${prefix}${key}.`) : [`${prefix}${key}`];
}).sort();
for (const locale of Object.values(contactLocales)) {
  if (JSON.stringify(keys(locale)) !== JSON.stringify(keys(ko))) throw new Error(`Missing contact translations: ${locale.lang}`);
}

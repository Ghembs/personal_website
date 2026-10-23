// Language of the site, shared by every page: Italian or English, remembered,
// the browser's at first. Each page keeps its own dictionary { it: {}, en: {} }.
const I18N = (() => {
  const KEY = 'site-lang';
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
  if (lang !== 'it' && lang !== 'en') lang = (navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en';
  document.documentElement.lang = lang;
  return {
    get lang() { return lang; },
    get other() { return lang === 'it' ? 'en' : 'it'; },
    set(l) {
      lang = l;
      document.documentElement.lang = l;
      try { localStorage.setItem(KEY, l); } catch (e) { /* private mode */ }
    },
    t(dict, key, vars) {
      let v = dict[lang]?.[key] ?? dict.it?.[key] ?? key;
      if (vars) for (const [k, x] of Object.entries(vars)) v = v.replaceAll(`{${k}}`, x);
      return v;
    },
    // [data-i18n] gets its text, [data-i18n-attr="attr:key;attr:key"] attributes.
    apply(dict, root = document) {
      const d = dict[lang] || {};
      root.querySelectorAll('[data-i18n]').forEach((el) => { if (d[el.dataset.i18n] != null) el.innerHTML = d[el.dataset.i18n]; });
      root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        for (const pair of el.dataset.i18nAttr.split(';')) {
          const [attr, key] = pair.split(':');
          if (d[key] != null) el.setAttribute(attr, d[key]);
        }
      });
    },
  };
})();

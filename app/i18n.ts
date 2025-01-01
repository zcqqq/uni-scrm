import i18next from 'i18next';
import enMain from '../src/locales/en/main.json';
import enChannel from '../src/locales/en/channel.json';
import enSetting from '../src/locales/en/setting.json';
import enFallback from '../src/locales/en/fallback.json';
import cnMain from '../src/locales/cn/main.json';
import cnChannel from '../src/locales/cn/channel.json';
import cnSetting from '../src/locales/cn/setting.json';

export const defaultNS = 'main';
export const fallbackNS = 'fallback';

i18next.init({
  debug: true,
  fallbackLng: 'cn',
  defaultNS,
  fallbackNS,
  resources: {
    en: {
      main: enMain,
      channel: enChannel,
      setting: enSetting,
      fallback: enFallback,
    },
    cn: {
      main: cnMain,
      channel: cnChannel,
      setting: cnSetting,
    },
  },
});

export default i18next;
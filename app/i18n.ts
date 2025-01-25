import i18next from 'i18next';
import enMain from '../src/locales/en/Main.json';
import enChannel from '../src/locales/en/Channel.json';
import enContent from '../src/locales/en/Content.json';
import enSetting from '../src/locales/en/Setting.json';
import enFallback from '../src/locales/en/Fallback.json';
import cnMain from '../src/locales/cn/Main.json';
import cnChannel from '../src/locales/cn/Channel.json';
import cnContent from '../src/locales/cn/Content.json';
import cnSetting from '../src/locales/cn/Setting.json';

export const defaultNS = 'Main';
export const fallbackNS = 'Fallback';

i18next.init({
  debug: true,
  fallbackLng: 'cn',
  defaultNS,
  fallbackNS,
  resources: {
    en: {
      Main: enMain,
      Channel: enChannel,
      Content: enContent,
      Setting: enSetting,
      Fallback: enFallback,
    },
    cn: {
      Main: cnMain,
      Channel: cnChannel,
      Content: cnContent,
      Setting: cnSetting,
    },
  },
});

export default i18next;
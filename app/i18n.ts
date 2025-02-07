import i18next from 'i18next';
import enMain from '../src/locales/en/main.json';
import enChannel from '../src/locales/en/channel.json';
import enContent from '../src/locales/en/content.json';
import enSetting from '../src/locales/en/setting.json';
import enFallback from '../src/locales/en/fallback.json';
import cnMain from '../src/locales/cn/main.json';
import cnChannel from '../src/locales/cn/channel.json';
import cnContent from '../src/locales/cn/content.json';
import cnSetting from '../src/locales/cn/setting.json';

export const defaultNS = 'Main';
export const fallbackNS = 'Fallback';

i18next.init({
  debug: false,
  fallbackLng: navigator.language.split('-')[0].toUpperCase() || 'EN',
  defaultNS,
  fallbackNS,
  resources: {
    EN: {
      Main: enMain,
      Channel: enChannel,
      Content: enContent,
      Setting: enSetting,
      Fallback: enFallback,
    },
    CN: {
      Main: cnMain,
      Channel: cnChannel,
      Content: cnContent,
      Setting: cnSetting,
    },
  }
});

export default i18next;
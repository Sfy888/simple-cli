import { createI18n } from 'vue-i18n';
import en from './en';
import zh from './zh';
const messages = {
  en,
  zh
}

const i18n = createI18n({
    legacy: false, // 设置为false，启用composition API模式
    messages,
    locale: 'zh', // 设置默认语言为英语
})

export default i18n;
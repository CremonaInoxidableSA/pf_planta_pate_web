import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import spanish from "./locales/spanish.json";
import english from "./locales/english.json";

const resources = {
  es: {
    locales: spanish,
  },
  en: {
    locales: english,
  },
};

export const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  ns: ["locales"],
  interpolation: {
    escapeValue: false,
    skipOnVariables: false,
  },
});

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof resources)["es"];
    returnNull: false;
    defaultNS: "layout";
  }
}

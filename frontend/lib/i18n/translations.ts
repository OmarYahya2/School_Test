import ar from "./locales/ar"

export type Language = "ar" | "en"
export type Translations = typeof ar
export type TranslationSet = Record<Language, Translations>

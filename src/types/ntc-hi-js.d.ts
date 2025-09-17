declare module 'ntc-hi-js' {
  interface ColorMatch {
    hex: string;
    name: string;
    exact: boolean;
  }

  interface NameResult {
    color: ColorMatch;
    shade?: ColorMatch;
  }

  interface NTC {
    name(color: string | number | number[] | object, locale?: string): NameResult;
    fallback_locale: string;
    dictionaries_path: Record<string, string>;
    build_dictionaries(): void;
  }

  const ntc: NTC;
  export default ntc;
}

export interface IPreferredLanugageOption {
  featureToggle: string | null;
  value: string | '';
  label: string;
}

export interface IPreferredLanguageFeature {
  selectedLanguageCode?: string | undefined;
  languageOptions: IPreferredLanugageOption[];
  currentUserId: string;
  hasSparkCall: boolean;
  save: Function | null;
}

export class PreferredLanguageFeature implements IPreferredLanguageFeature {
  public selectedLanguageCode?: string | undefined = '';
  public languageOptions: IPreferredLanugageOption[] = [];
  public currentUserId: string = '';
  public hasSparkCall: boolean = false;
  public save: Function | null = null;
}

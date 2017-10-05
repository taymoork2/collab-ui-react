import 'l10n/en_US.json';
import { languageConfigs } from './languages';

interface ILanguage {
  browserCodes: string[];
  label: string;
  value: string;
}

const languages: ILanguage[] = _.map(languageConfigs, languageConfig => ({
  browserCodes: languageConfig.browserCodes,
  label: languageConfig.label,
  value: languageConfig.value,
}));
const DEFAULT_LANGUAGE = 'en_US';

export class LanguagesProvider implements ng.IServiceProvider {

  /* @ngInject */
  constructor(
    private $windowProvider,
  ) {}

  public $get() {
    return languages;
  }

  public getFallbackLanguage() {
    return DEFAULT_LANGUAGE;
  }

  public getPreferredLanguage() {
    const browserLanguages = this.getBrowserLanguages();
    let foundLanguage: ILanguage | undefined;

    _.find(browserLanguages, browserLanguage => {
      foundLanguage = _.find(languages, language => _.some(language.browserCodes, browserCode => _.startsWith(browserCode, browserLanguage)));
      return !!foundLanguage;
    });

    if (foundLanguage) {
      return foundLanguage.value;
    } else {
      return DEFAULT_LANGUAGE;
    }
  }

  private getBrowserLanguages(): string[] {
    const navigatorProperties = [
      'languages',
      'language',
      'browserLanguage',
      'systemLanguage',
      'userLanguage',
    ];
    let navigatorPropertyValue: string | string[] | undefined;
    const navigator = this.$windowProvider.$get().navigator;

    _.find(navigatorProperties, navigatorProperty => {
      navigatorPropertyValue = _.get(navigator, navigatorProperty);
      return !!navigatorPropertyValue;
    });

    if (_.isArray(navigatorPropertyValue)) {
      return _.map(navigatorPropertyValue, language => this.formatLanguage(language));
    } else if (_.isString(navigatorPropertyValue)) {
      return [this.formatLanguage(navigatorPropertyValue)];
    } else {
      return [];
    }
  }

  private formatLanguage(language: string) {
    const userLangSplit = _.split(language, /[-_]+/, 2);
    if (userLangSplit.length <= 1) {
      return language;
    }

    return _.toLower(userLangSplit[0]) + '_' + _.toUpper(userLangSplit[1]);
  }
}

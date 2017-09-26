import 'l10n/en_US.json';
import { languageConfigs } from './languages';

const languages = _.map(languageConfigs, languageConfig => ({
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
    const browserLanguages = _.flatten([
      this.getBrowserLanguage(),
      DEFAULT_LANGUAGE,
    ]);

    const preferredLanguage = _.reduce<string, string | undefined>(browserLanguages, (foundLanguage, browserLanguage) => {
      if (foundLanguage) {
        return foundLanguage;
      }

      const findLanguage = _.find(languages, language => {
        const matchesBrowserCode = _.some(language.browserCodes, browserCode => {
          return browserCode === browserLanguage || _.startsWith(browserCode, browserLanguage);
        });
        if (matchesBrowserCode) {
          return true;
        }

        return false;
      });

      if (findLanguage) {
        return findLanguage.value;
      }
    }, '');

    return preferredLanguage || DEFAULT_LANGUAGE;
  }

  private getBrowserLanguage() {
    const navigatorProperties = [
      'languages',
      'language',
      'browserLanguage',
      'systemLanguage',
      'userLanguage',
    ];
    const navigator = this.$windowProvider.$get().navigator;
    const navigatorLanguage = _.reduce<string, string | string[] | undefined>(navigatorProperties, (foundLanguage, navigatorProperty) => {
      if (foundLanguage) {
        return foundLanguage;
      }

      const navigatorPropertyValue = _.get<string | string[] | undefined>(navigator, navigatorProperty);
      if (_.isArray(navigatorPropertyValue)) {
        return _.map(navigatorPropertyValue, language => this.formatLanguage(language));
      } else if (_.isString(navigatorPropertyValue)) {
        return this.formatLanguage(navigatorPropertyValue);
      }
    }, '');

    return navigatorLanguage || DEFAULT_LANGUAGE;
  }

  private formatLanguage(language: string) {
    const userLangSplit = _.split(language, /[-_]+/, 2);
    if (userLangSplit.length <= 1) {
      return language;
    }

    return _.toLower(userLangSplit[0]) + '_' + _.toUpper(userLangSplit[1]);
  }
}

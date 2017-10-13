import { languageConfigs } from './languages';

const DEFAULT = 'en_US';

/* @ngInject */
export const l10nBundleLoader = ($q) => {
  return (options) => {
    return $q((resolve) => {
      let language = _.find(languageConfigs, {
        value: _.get(options, 'key'),
      });
      if (!language) {
        // this should never happen since we validate our languages files with the config
        language = _.find(languageConfigs, {
          value: DEFAULT,
        });
      }
      language.loadJson(resolve);
    });
  };
};

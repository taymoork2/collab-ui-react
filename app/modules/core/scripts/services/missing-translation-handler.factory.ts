/* @ngInject */
const missingTranslationHandler = ($log: ng.ILogService, Config) => {
  return (translationID: string) => {
    if (!Config.isDev()) {
      return translationID;
    } else {
      $log.error(`😖 Translation for ${translationID} doesn't exist`);
      return `😖 No translation found for the key: ${translationID}`;
    }
  };
};

export default angular
  .module('core.missing-translation-handler', [
    require('modules/core/config/config').default,
  ])
  .factory('missingTranslationHandler', missingTranslationHandler)
  .name;

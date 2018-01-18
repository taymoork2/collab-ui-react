import { PreferredLanguageComponent } from './preferredLanguage.component';
export * from './preferredLanguage.interfaces';
export default angular
  .module('huron.preferred-language', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/config/config').default,
  ])
  .component('ucPreferredLanguage', new PreferredLanguageComponent())
  .name;

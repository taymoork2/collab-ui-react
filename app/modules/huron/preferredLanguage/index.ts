import { PreferredLanguageComponent } from './preferredLanguage.component';

export default angular
  .module('huron.preferred-language', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/config/config'),
  ])
  .component('ucPreferredLanguage', new PreferredLanguageComponent())
  .name;

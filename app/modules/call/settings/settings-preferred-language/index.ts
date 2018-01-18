import { PreferredLanguageComponent } from './settings-preferred-language.component';

export { PreferredLanguageComponent };

export default angular
  .module('call.settings.preferred-language', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucSettingsPreferredLanguage', new PreferredLanguageComponent())
  .name;

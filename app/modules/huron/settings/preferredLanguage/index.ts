import { PreferredLanguageComponent } from './preferredLanguage.component';

export * from './preferredLanguage.component';

export default angular
  .module('huron.settings.preferred-language', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('ucPreferredLanguage', new PreferredLanguageComponent())
  .name;

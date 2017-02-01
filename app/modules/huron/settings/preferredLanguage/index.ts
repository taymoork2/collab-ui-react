import { PreferredLanguageComponent } from './preferredLanguage.component';

export * from './preferredLanguage.component';

export default angular
  .module('huron.settings.preferred-language', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucPreferredLanguage', new PreferredLanguageComponent())
  .name;

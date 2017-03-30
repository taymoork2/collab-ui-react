import { PreferredLanguageComponent } from './preferredLanguage.component';

export default angular
  .module('huron.preferred-language', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
    require('modules/core/config/config'),
  ])
  .component('ucPreferredLanguage', new PreferredLanguageComponent())
  .name;

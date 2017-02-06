import { PreferredLanguageService } from './preferredLanguage.service';
import { PreferredLanguageComponent } from './preferredLanguage.component';

export default angular
  .module('huron.preferred-language', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('modules/core/config/config'),
  ])
  .component('ucPreferredLanguage', new PreferredLanguageComponent())
  .service('PreferredLanguageService', PreferredLanguageService)
  .name;

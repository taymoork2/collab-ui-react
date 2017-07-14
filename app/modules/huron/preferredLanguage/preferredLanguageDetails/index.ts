import { PreferredLanguageDetailsComponent } from './preferredLanguageDetails.component';
import preferredLanguageModule from 'modules/huron/preferredLanguage';

export default angular
  .module('huron.user.preferredLanguageDetails', [
    require('angular-resource'),
    preferredLanguageModule,
  ])
  .component('ucPreferredLanguageDetails', new PreferredLanguageDetailsComponent())
  .name;

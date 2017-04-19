import { UserDetailsOverviewComponent } from './userDetailsOverview.component';
import preferredLanguageModule from '../../../huron/preferredLanguage';

export default angular
  .module('huron.user.userDetailsOverview', [
    require('angular-resource'),
    preferredLanguageModule,
  ])
  .component('ucUserDetailsOverview', new UserDetailsOverviewComponent())
  .name;

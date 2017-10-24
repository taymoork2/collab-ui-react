import { LinkedSitesComponent } from './linked-sites.component';
import featureToggleServiceModule from 'modules/core/featureToggle';

export default angular
  .module('account-linking', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/webex/utils').default,
    featureToggleServiceModule,
  ])
  .component('linkedSites', new LinkedSitesComponent())
  .name;

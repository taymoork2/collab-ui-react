import { LinkedSitesComponent } from './linked-sites.component';
import featureToggleServiceModule from 'modules/core/featureToggle';
import webExUtilsModule from 'modules/webex/utils';
import * as authInfoModule from 'modules/core/scripts/services/authinfo';

export default angular
  .module('account-linking', [
    authInfoModule,
    webExUtilsModule,
    featureToggleServiceModule,
  ])
  .component('linkedSites', new LinkedSitesComponent())
  .name;

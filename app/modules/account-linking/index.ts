require('./_account-linking.scss');

import accountLinkingWizard from './linking-wizard';
import { LinkedSitesGridComponent } from './sites-list/linked-sites-grid.component';
import { LinkedSitesComponent } from './linked-sites.component';
import { LinkedSitesDetailsComponent } from './linked-sites-details.component';
import { LinkedSitesGotoWebexComponent } from './linked-sites-gotowebex.component';
import { AccountLinkingWizardComponent } from './linking-wizard/account-linking-wizard.component';

import { LinkedSitesService } from './linked-sites.service';
import { LinkedSitesWebExService } from './linked-sites-webex.service';
import featureToggleServiceModule from 'modules/core/featureToggle';
import webExUtilsModule from 'modules/webex/utils';
import * as authInfoModule from 'modules/core/scripts/services/authinfo';
import webExApiModule from 'modules/webex/xmlApi';

export default angular
  .module('account-linking', [
    require('angular-translate'),
    accountLinkingWizard,
    authInfoModule,
    webExUtilsModule,
    featureToggleServiceModule,
    webExApiModule,
  ])

  .component('linkedSitesGrid', new LinkedSitesGridComponent())
  .component('linkedSites', new LinkedSitesComponent())
  .component('linkedSitesDetails', new LinkedSitesDetailsComponent())
  .component('accountLinkingWizard', new AccountLinkingWizardComponent())
  .component('linkedSitesGotoWebex', new LinkedSitesGotoWebexComponent())
  .service('LinkedSitesService', LinkedSitesService)
  .service('LinkedSitesWebExService', LinkedSitesWebExService)
  .name;

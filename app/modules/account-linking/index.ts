require('./_account-linking.scss');

import { LinkedSitesComponent } from './linked-sites.component';
import { LinkedSitesDetailsComponent } from './linked-sites-details.component';
import { LinkedSitesGotoWebexComponent } from './linked-sites-gotowebex.component';

import { LinkedSitesService } from './linked-sites.service';
import { LinkedSitesMockService } from './linked-sites-mock.service';
import { LinkedSitesWebExService } from './linked-sites-webex.service';
import featureToggleServiceModule from 'modules/core/featureToggle';
import webExUtilsModule from 'modules/webex/utils';
import * as authInfoModule from 'modules/core/scripts/services/authinfo';
import webExApiModule from 'modules/webex/xmlApi';
import accountLinkingWizardModule from 'modules/account-linking/linking-wizard';
import notificationsModule from 'modules/core/notifications';
import linkedSitesGridModule from 'modules/account-linking/sites-list';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';

export default angular
  .module('Accountlinking', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    authInfoModule,
    webExUtilsModule,
    featureToggleServiceModule,
    webExApiModule,
    accountLinkingWizardModule,
    notificationsModule,
    linkedSitesGridModule,
    userServiceModuleName,
  ])

  .component('linkedSites', new LinkedSitesComponent())
  .component('linkedSitesDetails', new LinkedSitesDetailsComponent())
  .component('linkedSitesGotoWebex', new LinkedSitesGotoWebexComponent())
  .service('LinkedSitesService', LinkedSitesService)
  .service('LinkedSitesMockService', LinkedSitesMockService)
  .service('LinkedSitesWebExService', LinkedSitesWebExService)
  .name;

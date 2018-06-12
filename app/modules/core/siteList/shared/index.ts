import { SiteListService } from './site-list.service';

/* Dependencies */
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import featureToggleModuleName from 'modules/core/featureToggle';
import offerNameModuleName from 'modules/core/shared/offer-name';
import setupWizardServiceModuleName from 'modules/core/setupWizard/setup-wizard.service';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';
import webexApiGatewayModuleName from 'modules/webex/apiGateway';
import webExUtilsModuleName from 'modules/webex/utils';

export default angular
  .module('core.siteList.shared', [
    require('angular-translate'),
    authInfoModuleName,
    featureToggleModuleName,
    offerNameModuleName,
    setupWizardServiceModuleName,
    urlConfigModuleName,
    userServiceModuleName,
    webexApiGatewayModuleName,
    webExUtilsModuleName,
  ])
  .service('SiteListService', SiteListService)
  .name;

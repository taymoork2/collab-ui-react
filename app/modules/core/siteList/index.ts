import './_site-list.scss';
import { SiteListComponent } from './site-list.component';

import siteDetailModuleName from './site-detail';
import sitesGridModuleName from './sites-grid';

import apiGatewayModuleName from 'modules/webex/apiGateway';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import * as authModuleName from 'modules/core/auth/auth';
import featureToggleModuleName from 'modules/core/featureToggle';
import modalModuleName from 'modules/core/modal';
import setupWizardServiceModuleName from 'modules/core/setupWizard/setup-wizard.service';
import siteListSharedModuleName from 'modules/core/siteList/shared';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';
import webexSiteModuleName from './webex-site';
import webExUtilsModuleName from 'modules/webex/utils';

export default angular
  .module('core.siteList', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    apiGatewayModuleName,
    authInfoModuleName,
    authModuleName,
    featureToggleModuleName,
    modalModuleName,
    setupWizardServiceModuleName,
    siteDetailModuleName,
    sitesGridModuleName,
    siteListSharedModuleName,
    urlConfigModuleName,
    userServiceModuleName,
    webExUtilsModuleName,
    webexSiteModuleName,
  ])
  .component('siteList', new SiteListComponent())
  .name;

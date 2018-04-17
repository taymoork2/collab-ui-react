
const BrandingCtrl = require('./brandingCtrl');
const BrandingExampleCtrl = require('./brandingExample.controller');
import { PartnerProfileBrandingDirectiveFactory } from './branding.directive';

import './_branding.scss';
import './_brandingUpload.scss';

import featureToggleModule from 'modules/core/featureToggle';
import notificationModule from 'modules/core/notifications';

export default angular.module('core.partnerProfile.branding', [
  require('angular-cache'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  require('modules/core/scripts/services/userlist.service'),
  require('modules/core/scripts/services/brand.service'),
  require('modules/webex/webexClientVersions/webexClientVersion.svc'),
  featureToggleModule,
  notificationModule,
])
  .controller('BrandingCtrl', BrandingCtrl)
  .controller('BrandingExampleCtrl', BrandingExampleCtrl)
  .directive('crPartnerProfileBranding', PartnerProfileBrandingDirectiveFactory)
  .name;

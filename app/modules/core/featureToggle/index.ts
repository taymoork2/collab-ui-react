import { DirSyncService, IDirSyncService, IDirectoryConnector } from './dirSync.service';
const FeatureToggleDirective = require('./featureToggle.directive');
const FeatureToggleServices = require('./featureToggle.service');

export { IDirSyncService, IDirectoryConnector };

const urlConfigModule = require('modules/core/config/urlConfig');
const authInfoModule = require('modules/core/scripts/services/authinfo');
const authModule = require('modules/core/auth/auth');
const orgServiceModule = require('modules/core/scripts/services/org.service');
const telephonyConfigModule = require('modules/huron/telephony/telephonyConfig');
const ngResourceModule = require('angular-resource');
const ngUiRouterModule = require('angular-ui-router');

export default angular
  .module('core.featuretoggle', [
    ngUiRouterModule,
    ngResourceModule,
    telephonyConfigModule,
    urlConfigModule,
    authInfoModule,
    authModule,
    orgServiceModule,
  ])
  .service('FeatureToggleService', FeatureToggleServices)
  .directive('crFeatureToggle', FeatureToggleDirective)
  .service('DirSyncService', DirSyncService)
  .name;

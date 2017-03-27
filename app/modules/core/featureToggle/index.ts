import { DirSyncService, IDirSyncService, IDirectoryConnector } from './dirSync.service';

export { IDirSyncService, IDirectoryConnector };

let FeatureToggleDirective = require('./featureToggle.directive');
let FeatureToggleServices = require('./featureToggle.service');

let urlConfigModule = require('modules/core/config/urlConfig');
let authInfoModule = require('modules/core/scripts/services/authinfo');
let authModule = require('modules/core/auth/auth');
let orgServiceModule = require('modules/core/scripts/services/org.service');
let telephonyConfigModule = require('modules/huron/telephony/telephonyConfig');
let ngResourceModule = require('angular-resource');
let ngUiRouterModule = require('angular-ui-router');

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

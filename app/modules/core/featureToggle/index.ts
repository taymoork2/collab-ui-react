import { DirSyncService, IDirSyncService, IDirectoryConnector } from './dirSync.service';
import * as features from 'modules/core/featureToggle/features.config.js'; // TODO: change path to relative once 'features.config.js' has been ported to TS
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

// TODO: remove this after converting FeatureToggleService to a TypeScript class
export declare class FeatureToggleService {
  public hasFeatureToggleOrIsTestOrg(feature: string): ng.IPromise<boolean>;
  public supports(feature: string): ng.IPromise<boolean>;
  public features: features;
}

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

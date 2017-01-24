
let FeatureToggleDirective = require('./featureToggle.directive');
let FeatureToggleServices = require('./featureToggle.service');

let urlConfigModule = require('modules/core/config/urlConfig');
let authInfoModule = require('modules/core/scripts/services/authinfo');
let telephonyConfigModule = require('modules/huron/telephony/telephonyConfig');
let ngResourceModule = require('angular-resource');
let ngUiRouterModule = require('angular-ui-router');
let orgServiceModule = require('modules/core/scripts/services/org.service');

export default angular
  .module('core.featuretoggle', [
    ngUiRouterModule,
    ngResourceModule,
    telephonyConfigModule,
    urlConfigModule,
    authInfoModule,
    orgServiceModule,
  ])
  .service('FeatureToggleService', FeatureToggleServices)
  .directive('crFeatureToggle', FeatureToggleDirective)
  .name;

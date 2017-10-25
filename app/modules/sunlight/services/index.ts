const SunlightConfigService = require('./sunlightConfigService');
const SunlightReportService = require('./sunlightReportService');
const ConfigServices = require('./sunlightServices');
const URService = require('./urService');

const urlConfigModule = require('modules/core/config/urlConfig');
const authInfoModule = require('modules/core/scripts/services/authinfo');

export default angular
  .module('sunlight.services', [
    'ngResource',
    urlConfigModule,
    authInfoModule,
  ])
  .service('SunlightConfigService', SunlightConfigService)
  .service('SunlightReportService', SunlightReportService)
  .service('URService', URService)
  .factory('ConfigTemplateService', ConfigServices.ConfigTemplateService)
  .factory('ConfigUserService', ConfigServices.ConfigUserService)
  .name;

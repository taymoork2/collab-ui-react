let SunlightConfigService = require('./sunlightConfigService');
let SunlightReportService = require('./sunlightReportService');
let ConfigServices = require('./sunlightServices');

let urlConfigModule = require('modules/core/config/urlConfig');
let authInfoModule = require('modules/core/scripts/services/authinfo');

export default angular
  .module('sunlight.services', [
    'ngResource',
    urlConfigModule,
    authInfoModule,
  ])
  .service('SunlightConfigService', SunlightConfigService)
  .service('SunlightReportService', SunlightReportService)
  .factory('ConfigTemplateService', ConfigServices.ConfigTemplateService)
  .factory('ConfigUserService', ConfigServices.ConfigUserService)
  .name;

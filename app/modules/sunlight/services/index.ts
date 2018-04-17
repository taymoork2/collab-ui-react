import { SunlightConstantsService } from './SunlightConstantsService';
import { SunlightUtilitiesService } from './SunlightUtilitiesService';
import contextAdminAuthorizationServiceModuleName  from 'modules/context/services/context-authorization-service';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';

const SunlightConfigService = require('./sunlightConfigService');
const SunlightReportService = require('./sunlightReportService');
const ConfigServices = require('./sunlightServices');
const URService = require('./urService');

export default angular
  .module('sunlight.services', [
    'ngResource',
    authInfoModuleName,
    contextAdminAuthorizationServiceModuleName,
    urlConfigModuleName,
  ])
  .service('SunlightConfigService', SunlightConfigService)
  .service('SunlightReportService', SunlightReportService)
  .service('SunlightUtilitiesService', SunlightUtilitiesService)
  .service('SunlightConstantsService', SunlightConstantsService)
  .service('URService', URService)
  .factory('ConfigTemplateService', ConfigServices.ConfigTemplateService)
  .factory('ConfigUserService', ConfigServices.ConfigUserService)
  .name;

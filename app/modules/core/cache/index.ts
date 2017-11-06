import HybridServicesExtrasServiceModuleName from 'modules/hercules/services/hybrid-services-extras.service';
import USSServiceModuleName from 'modules/hercules/services/uss.service';

import { ApiCacheManagementService } from './api-cache-management-service';

export default angular
  .module('core.cache', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/urlConfig'),
    HybridServicesExtrasServiceModuleName,
    USSServiceModuleName,
  ])
  .service('ApiCacheManagementService', ApiCacheManagementService)
  .name;

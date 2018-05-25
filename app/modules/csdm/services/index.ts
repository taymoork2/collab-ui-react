import { CsdmSearchService } from './csdmSearch.service';
import * as coreUrlConfigModule from 'modules/core/config/urlConfig';
import { DeviceSearchConverter } from './deviceSearchConverter';
import { SearchTranslator } from './search/searchTranslator';
import { SearchRequestCompressor } from './search/searchRequestCompressor';
import { CsdmBulkService } from './csdmBulk.service';
import { CsdmAnalyticsHelper } from './csdm-analytics-helper.service';
import { WifiProximityService } from './wifiProximity.service';

export default angular
  .module('Csdm.services', [
    coreUrlConfigModule,
    require('angular-sanitize'),
    require('angular-translate'),
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
  ])
  .service('CsdmAnalyticsHelper', CsdmAnalyticsHelper)
  .service('CsdmBulkService', CsdmBulkService)
  .service('CsdmSearchService', CsdmSearchService)
  .service('DeviceSearchConverter', DeviceSearchConverter)
  .service('DeviceSearchTranslator', SearchTranslator)
  .service('SearchRequestCompressor', SearchRequestCompressor)
  .service('WifiProximityService', WifiProximityService)
  .name;

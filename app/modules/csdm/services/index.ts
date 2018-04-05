import { CsdmSearchService } from './csdmSearch.service';
import * as coreUrlConfigModule from 'modules/core/config/urlConfig';
import { DeviceSearchConverter } from './deviceSearchConverter';
import { SearchTranslator } from './search/searchTranslator';
import { SearchRequestCompressor } from './search/searchRequestCompressor';
import { CsdmBulkService } from './csdmBulk.service';

export default angular
  .module('Csdm.services', [
    coreUrlConfigModule,
    require('modules/core/scripts/services/authinfo'),
    require('angular-translate'),
    require('angular-sanitize'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
  ])
  .service('CsdmSearchService', CsdmSearchService)
  .service('DeviceSearchConverter', DeviceSearchConverter)
  .service('DeviceSearchTranslator', SearchTranslator)
  .service('SearchRequestCompressor', SearchRequestCompressor)
  .service('CsdmBulkService', CsdmBulkService)
  .name;

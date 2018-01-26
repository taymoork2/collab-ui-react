import { CsdmSearchService } from './csdmSearch.service';
import * as coreUrlConfigModule from 'modules/core/config/urlConfig';
import { DeviceSearchConverter } from './deviceSearchConverter';
import { SearchTranslator } from './search/searchTranslator';
import { SearchRequestCompressor } from './search/searchRequestCompressor';

export default angular
  .module('Csdm.services', [
    coreUrlConfigModule,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
  ])
  .service('CsdmSearchService', CsdmSearchService)
  .service('DeviceSearchConverter', DeviceSearchConverter)
  .service('DeviceSearchTranslator', SearchTranslator)
  .service('SearchRequestCompressor', SearchRequestCompressor)
  .name;

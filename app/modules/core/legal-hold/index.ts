import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import configModuleName from 'modules/core/config/config';

import { LegalHoldService } from './legal-hold.service';

export default angular
  .module('core.legal-hold', [
    authinfoModuleName,
    configModuleName,
    urlConfigModuleName,
  ])
  .service('LegalHoldService', LegalHoldService)
  .name;

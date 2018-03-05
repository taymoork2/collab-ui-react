import * as authModuleName from 'modules/core/auth/auth';
import metricsModuleName from 'modules/core/metrics';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import windowModuleName from 'modules/core/window';

import { SecurityPolicyViolationService } from 'modules/core/security/securitypolicyviolation.service';

export default angular
  .module('core.security', [
    authModuleName,
    metricsModuleName,
    urlConfigModuleName,
    windowModuleName,
  ])
  .service('SecurityPolicyViolationService', SecurityPolicyViolationService)
  .name;

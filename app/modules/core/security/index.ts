import windowModule from 'modules/core/window';
import { SecurityPolicyViolationService } from 'modules/core/security/securitypolicyviolation.service';

export default angular
  .module('core.security-policy-violation-service', [
    require('modules/core/auth/auth'),
    require('modules/core/metrics/metrics.service'),
    require('modules/core/config/urlConfig'),
    windowModule,
  ])
  .service('SecurityPolicyViolationService', SecurityPolicyViolationService)
  .name;

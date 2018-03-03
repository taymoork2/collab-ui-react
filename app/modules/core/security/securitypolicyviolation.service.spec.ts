import moduleName from './index';

import { SecurityPolicyViolationService } from './securitypolicyviolation.service';

describe('SecurityPolicyViolationService', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$window',
      'Auth',
      'MetricsService',
      'SecurityPolicyViolationService'
    );
    this.eventName = 'securitypolicyviolation';
    spyOn(this.MetricsService, 'trackOperationalMetric');
  });

  describe('Response to a securitypolicyviolation event', () => {
    it('should trigger listener and expect the metrics service to have been called', function () {
      spyOn(this.SecurityPolicyViolationService.onSecurityPolicyViolation).and.callThrough();
      this.SecurityPolicyViolationService.init();
      this.$window.dispatchEvent(new Event(this.eventName));
      expect(this.onSecurityPolicyViolation).toHaveBeenCalledTimes(1);
      expect(this.MetricsService.trackOperationalMetric).toHaveBeenCalled();
    });
  });
});

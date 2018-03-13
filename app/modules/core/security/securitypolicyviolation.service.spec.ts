import moduleName from './index';

describe('SecurityPolicyViolationService', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$window',
      'Auth',
      'MetricsService',
      'SecurityPolicyViolationService',
      'WindowEventService',
    );
    this.eventName = 'securitypolicyviolation';
    spyOn(this.MetricsService, 'trackOperationalMetric');
    spyOn(this.Auth, 'isLoggedIn').and.returnValue(true);
  });

  describe('Response to a securitypolicyviolation event', () => {
    it('should trigger listener and expect the metrics service to have been called', function () {
      spyOn(this.SecurityPolicyViolationService, 'onSecurityPolicyViolation').and.callThrough();
      this.SecurityPolicyViolationService.init();
      this.$window.dispatchEvent(new Event(this.eventName));
      expect(this.SecurityPolicyViolationService.onSecurityPolicyViolation).toHaveBeenCalledTimes(1);
      expect(this.MetricsService.trackOperationalMetric).toHaveBeenCalled();
    });
  });
});

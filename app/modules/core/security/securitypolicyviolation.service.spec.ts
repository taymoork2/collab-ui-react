import { SecurityPolicyViolationService } from './securitypolicyviolation.service';

describe('SecurityPolicyViolationService', () => {
  beforeEach(function () {
    this.initModules(SecurityPolicyViolationService);
    this.injectDependencies('$window', 'Auth', 'MetricsService', 'SecurityPolicyViolationService');
    this.eventListener = jasmine.createSpy('listenerSpy');
    this.eventName = 'securitypolicyviolation';
    spyOn(this.MetricsService, 'trackOperationalMetric');
  });

  describe('Response to a securitypolicyviolation event', function () {
    beforeEach(function () {
      this.SecurityPolicyViolationService.init();
      this.$window.dispatchEvent(new Event(this.eventName));
      expect(this.eventListener).toHaveBeenCalledTimes(1);
    });

    it('should trigger listener and expect the metrics service to have been called', function () {
      expect(this.MetricsService.trackOperationalMetric).toHaveBeenCalled();
    });
  });
});

'use strict';

describe('Service: ScheduleUpgradeChecker', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $rootScope, ScheduleUpgradeChecker, ScheduleUpgradeService;

  beforeEach(inject(function (_ScheduleUpgradeChecker_, _ScheduleUpgradeService_) {
    ScheduleUpgradeChecker = _ScheduleUpgradeChecker_;
    ScheduleUpgradeService = _ScheduleUpgradeService_;
    sinon.spy(ScheduleUpgradeService, 'get');
  }));

  describe('ScheduleUpgradeChecker.check', function () {
    it('should call ScheduleUpgradeService.get', function () {
      ScheduleUpgradeChecker.check();
      expect(ScheduleUpgradeService.get.calledOnce).toBe(true);
    });
  });
});

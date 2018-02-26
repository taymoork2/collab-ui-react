import ModuleName from './index';

describe('Service: HybridMediaUpgradeScheduleService', function () {
  beforeEach(function () {
    this.initModules(ModuleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'HybridMediaUpgradeScheduleService',
      'HybridServicesClusterService',
    );
    spyOn(this.HybridServicesClusterService, 'setUpgradeSchedule').and.returnValue(this.$q.resolve({}));
  });
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('updateUpgradeScheduleAndUI()', function () {
    it('should update upgrade schedule with the correct data', function () {
      const cluster = {
        id: 'sample-id',
      };
      const upgradeScheduleData = {
        scheduleTime: {
          value: 'some-time',
        },
        scheduleTimeZone: {
          value: 'some-time-zone',
        },
        scheduleDay: {
          value: 'some-day',
        },
      };
      this.HybridMediaUpgradeScheduleService.updateUpgradeScheduleAndUI(upgradeScheduleData, cluster);
      expect(this.HybridServicesClusterService.setUpgradeSchedule).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
        scheduleTime: upgradeScheduleData.scheduleTime.value,
        scheduleTimeZone: upgradeScheduleData.scheduleTimeZone.value,
        scheduleDays: upgradeScheduleData.scheduleDay.value,
      }));
    });

  });
});

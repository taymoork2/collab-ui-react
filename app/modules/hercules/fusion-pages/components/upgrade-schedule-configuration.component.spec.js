'use strict';

describe('Component: upgradeScheduleConfiguration', function () {
  var component, Authinfo, $scope, $q, $compile, $rootScope, FusionClusterService;

  beforeEach(module('Hercules'));
  beforeEach(module(mockDirectives));
  beforeEach(inject(dependencies));

  var upgradeScheduleMock = {
    scheduleDays: ['3'],
    scheduleTime: '05:00',
    scheduleTimeZone: 'Pacific/Tahiti',
    nextUpgradeWindow: {
      startTime: '2016-06-29T15:00:57.332Z',
      endTime: '2016-06-29T16:00:57.332Z'
    },
    acknowledged: true,
    moratoria: [{
      timeWindow: {
        startTime: '2016-06-29T15:00:35Z',
        endTime: '2016-06-29T16:00:35Z'
      },
      id: 'deadbeef'
    }]
  };

  it('should disable the day selector if the daily attribute is true', function () {
    // I wasted 2 days trying to test this without success…
  });

  describe('Controller: upgradeScheduleConfiguration', function () {
    var controller;

    it('should have daily as false', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(controller.daily).toBe(false);
    });

    it('should fetch the upgrade schedule when there is a valid cluster id', function () {
      var controller = initController($scope);
      expect(FusionClusterService.getUpgradeSchedule.calls.count()).toBe(0);
      $scope.clusterId = '123';
      $scope.$apply();
      expect(FusionClusterService.getUpgradeSchedule.calls.count()).toBe(1);
      expect(FusionClusterService.getUpgradeSchedule).toHaveBeenCalledWith('123');
      $scope.clusterId = '345';
      $scope.$apply();
      expect(FusionClusterService.getUpgradeSchedule.calls.count()).toBe(2);
      expect(FusionClusterService.getUpgradeSchedule).toHaveBeenCalledWith('345');
    });

    it('should update and fetch new data when form data are changed', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(FusionClusterService.setUpgradeSchedule.calls.count()).toBe(0);
      expect(FusionClusterService.getUpgradeSchedule.calls.count()).toBe(1);
      // modify the form
      controller.formData.scheduleTime = {
        label: '01:00',
        value: '01:00'
      };
      // simulate the change on the server also
      upgradeScheduleMock.scheduleTime = '01:00';
      // trigger the next tick
      $scope.$apply();
      expect(FusionClusterService.setUpgradeSchedule.calls.count()).toBe(1);
      expect(FusionClusterService.getUpgradeSchedule.calls.count()).toBe(2);
    });

    it('should delete all moratoria when changing the schedule', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(FusionClusterService.deleteMoratoria.calls.count()).toBe(0);
      controller.formData.scheduleTime = {
        label: '02:00',
        value: '02:00'
      };
      upgradeScheduleMock.scheduleTime = '02:00';
      $scope.$apply();
      expect(FusionClusterService.deleteMoratoria.calls.count()).toBe(1);
      expect(FusionClusterService.deleteMoratoria).toHaveBeenCalledWith(controller.clusterId, upgradeScheduleMock.moratoria[0].id);
    });

    xit('should broadcast ACK_SCHEDULE_UPGRADE when acknowledging', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      controller.postpone({
        preventDefault: function () {}
      });
      // this test is broken because Angular broadcasts $locationChangeStart first…
      expect($rootScope.$broadcast.calls.count()).toBe(1);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('ACK_SCHEDULE_UPGRADE');
    });

    it('should call postponeUpgradeSchedule and then fetch latest data when postponing', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      controller.postpone({
        preventDefault: function () {}
      });
      expect(FusionClusterService.postponeUpgradeSchedule.calls.count()).toBe(1);
      expect(FusionClusterService.getUpgradeSchedule.calls.count()).toBe(1);
    });
  });

  function mockDirectives($compileProvider) {
    // mock <cs-select>
    $compileProvider.directive('csSelect', function ($interpolate) {
      return {
        template: '<div>whatever</div>',
        // priority has to be higher than the "original" directive
        priority: 10,
        // stop there and don't try to match with another directive
        // unfortunately it breaks template interpolation…
        terminal: true,
        scope: {
          // only attribute we are interested in
          isDisabled: '='
        }
      };
    });
  }

  function dependencies(_$rootScope_, _$q_, _$compile_, _Authinfo_, _FusionClusterService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    FusionClusterService = _FusionClusterService_;
    spyOn(FusionClusterService, 'getUpgradeSchedule').and.returnValue($q.resolve(upgradeScheduleMock));
    spyOn(FusionClusterService, 'postponeUpgradeSchedule').and.returnValue($q.resolve());
    spyOn(FusionClusterService, 'setUpgradeSchedule').and.returnValue($q.resolve());
    spyOn(FusionClusterService, 'deleteMoratoria').and.returnValue($q.resolve());
    spyOn($rootScope, '$broadcast').and.callThrough();
  }

  function initController($scope) {
    var element = compileComponent($scope);
    return element.controller('upgradeScheduleConfiguration');
  }

  function compileComponent($scope) {
    var template = '<upgrade-schedule-configuration can-postpone="true" daily="false" cluster-id="clusterId"></upgrade-schedule-configuration>';
    var element = $compile(angular.element(template))($scope);
    $scope.$apply();
    return element;
  }
});

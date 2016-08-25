'use strict';

describe('Component: upgradeScheduleConfiguration', function () {
  var $scope, $q, $compile, $rootScope, FusionClusterService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDirectives));
  beforeEach(inject(dependencies));

  var upgradeScheduleMock = {
    scheduleDays: ['wednesday'],
    scheduleTime: '05:00',
    scheduleTimeZone: 'Pacific/Tahiti',
    nextUpgradeWindow: {
      startTime: '2016-06-29T15:00:57.332Z',
      endTime: '2016-06-29T16:00:57.332Z'
    },
    moratoria: [{
      timeWindow: {
        startTime: '2016-06-29T15:00:35Z',
        endTime: '2016-06-29T16:00:35Z'
      },
      id: 'deadbeef'
    }]
  };

  describe('Controller: upgradeScheduleConfiguration', function () {
    it('should fetch the upgrade schedule when there is a valid cluster id', function () {
      initController($scope);
      expect(FusionClusterService.get.calls.count()).toBe(0);
      $scope.clusterId = '123';
      $scope.$apply();
      expect(FusionClusterService.get.calls.count()).toBe(1);
      expect(FusionClusterService.get).toHaveBeenCalledWith('123');
      $scope.clusterId = '345';
      $scope.$apply();
      expect(FusionClusterService.get.calls.count()).toBe(2);
      expect(FusionClusterService.get).toHaveBeenCalledWith('345');
    });

    it('should update and fetch new data when form data are changed', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(FusionClusterService.setUpgradeSchedule.calls.count()).toBe(0);
      expect(FusionClusterService.get.calls.count()).toBe(1);
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
      expect(FusionClusterService.get.calls.count()).toBe(2);
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

    it('should call postponeUpgradeSchedule and then fetch latest data when postponing', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      controller.postpone({
        preventDefault: function () {}
      });
      expect(FusionClusterService.postponeUpgradeSchedule.calls.count()).toBe(1);
      expect(FusionClusterService.get.calls.count()).toBe(1);
    });

    it('should set the option to "everyDay" if all days are selected', function () {
      var modifiedUpgradeScheduleMock = upgradeScheduleMock;
      modifiedUpgradeScheduleMock.scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      FusionClusterService.get.and.returnValue($q.resolve({
        upgradeSchedule: upgradeScheduleMock
      }));
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(controller.formData.scheduleDay.value).toBe('everyDay');
    });
  });

  function mockDirectives($compileProvider) {
    // mock <cs-select>
    $compileProvider.directive('csSelect', function () {
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

  function dependencies(_$rootScope_, _$q_, _$compile_, _FusionClusterService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    FusionClusterService = _FusionClusterService_;
    spyOn(FusionClusterService, 'get').and.returnValue($q.resolve({
      upgradeSchedule: upgradeScheduleMock
    }));
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
    var template = '<upgrade-schedule-configuration cluster-id="clusterId"></upgrade-schedule-configuration>';
    var element = $compile(angular.element(template))($scope);
    $scope.$apply();
    return element;
  }
});

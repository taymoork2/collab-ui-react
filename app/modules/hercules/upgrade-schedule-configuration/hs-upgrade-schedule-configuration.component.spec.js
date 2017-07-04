'use strict';

describe('Component: hsUpgradeScheduleConfiguration', function () {
  var $scope, $q, $compile, $rootScope, HybridServicesClusterService, Notification, view;

  afterEach(function () {
    if (view) {
      view.remove();
    }
    view = undefined;
  });

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDirectives));
  beforeEach(inject(dependencies));

  var upgradeScheduleMock = {
    scheduleDays: ['wednesday'],
    scheduleTime: '05:00',
    scheduleTimeZone: 'Pacific/Tahiti',
    nextUpgradeWindow: {
      startTime: '2016-06-29T15:00:57.332Z',
      endTime: '2016-06-29T16:00:57.332Z',
    },
    moratoria: [{
      timeWindow: {
        startTime: '2016-06-29T15:00:35Z',
        endTime: '2016-06-29T16:00:35Z',
      },
      id: 'deadbeef',
    }],
  };

  describe('Controller: upgradeScheduleConfiguration', function () {
    it('should fetch the upgrade schedule when there is a valid cluster id', function () {
      initController($scope);
      expect(HybridServicesClusterService.get.calls.count()).toBe(0);
      $scope.clusterId = '123';
      $scope.$apply();
      expect(HybridServicesClusterService.get.calls.count()).toBe(1);
      expect(HybridServicesClusterService.get).toHaveBeenCalledWith('123');
      $scope.clusterId = '345';
      $scope.$apply();
      expect(HybridServicesClusterService.get.calls.count()).toBe(2);
      expect(HybridServicesClusterService.get).toHaveBeenCalledWith('345');
    });

    it('should update and fetch new data when form data are changed', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(HybridServicesClusterService.setUpgradeSchedule.calls.count()).toBe(0);
      expect(HybridServicesClusterService.get.calls.count()).toBe(1);
      // modify the form
      controller.formData.scheduleTime = {
        label: '01:00',
        value: '01:00',
      };
      // simulate the change on the server also
      upgradeScheduleMock.scheduleTime = '01:00';
      // trigger the next tick
      $scope.$apply();
      expect(HybridServicesClusterService.setUpgradeSchedule.calls.count()).toBe(1);
      expect(HybridServicesClusterService.get.calls.count()).toBe(2);
    });

    it('should delete all moratoria when changing the schedule', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      expect(HybridServicesClusterService.deleteMoratoria.calls.count()).toBe(0);
      controller.formData.scheduleTime = {
        label: '02:00',
        value: '02:00',
      };
      upgradeScheduleMock.scheduleTime = '02:00';
      $scope.$apply();
      expect(HybridServicesClusterService.deleteMoratoria.calls.count()).toBe(1);
      expect(HybridServicesClusterService.deleteMoratoria).toHaveBeenCalledWith(controller.clusterId, upgradeScheduleMock.moratoria[0].id);
    });

    it('should call postponeUpgradeSchedule and then fetch latest data when postponing', function () {
      $scope.clusterId = '123';
      var controller = initController($scope);
      var eventMock = {
        preventDefault: function () {},
      };
      controller.postpone(eventMock);
      expect(HybridServicesClusterService.postponeUpgradeSchedule.calls.count()).toBe(1);
      expect(HybridServicesClusterService.get.calls.count()).toBe(1);
      $scope.$apply();
      expect(Notification.success.calls.count()).toBe(1);
    });

    it('should set the option to "everyDay" if all days are selected', function () {
      var modifiedUpgradeScheduleMock = upgradeScheduleMock;
      modifiedUpgradeScheduleMock.scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      HybridServicesClusterService.get.and.returnValue($q.resolve({
        upgradeSchedule: upgradeScheduleMock,
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
          isDisabled: '=',
        },
      };
    });
  }

  function dependencies(_$rootScope_, _$q_, _$compile_, _HybridServicesClusterService_, _Notification_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    Notification = _Notification_;
    spyOn(HybridServicesClusterService, 'get').and.returnValue($q.resolve({
      upgradeSchedule: upgradeScheduleMock,
    }));
    spyOn(HybridServicesClusterService, 'postponeUpgradeSchedule').and.returnValue($q.resolve());
    spyOn(HybridServicesClusterService, 'setUpgradeSchedule').and.returnValue($q.resolve());
    spyOn(HybridServicesClusterService, 'deleteMoratoria').and.returnValue($q.resolve());
    spyOn(Notification, 'success');
    spyOn($rootScope, '$broadcast').and.callThrough();
  }

  function initController($scope) {
    var element = compileComponent($scope);
    return element.controller('hsUpgradeScheduleConfiguration');
  }

  function compileComponent($scope) {
    var template = '<hs-upgrade-schedule-configuration cluster-id="clusterId"></hs-upgrade-schedule-configuration>';
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
    return view;
  }
});
